import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

function getStripe() {
    const key = (process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder')
        .replace(/\s+/g, '')
        .replace(/^["']|["']$/g, '');
    return new Stripe(key, {
        apiVersion: '2024-06-20',
    });
}

// Use service role key to bypass RLS when updating orders
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
        const stripe = getStripe();
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        console.error('[Webhook Signature Error]', err.message);
        return NextResponse.json({ error: 'Webhook verification failed' }, { status: 400 });
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as any;

        try {
            // Extract delivery details and custom fields from the session
            const customFields = session.custom_fields || [];
            const shippingMethodField = customFields.find((f: any) => f.key === 'shipping_method');
            const shippingMethod = shippingMethodField?.dropdown?.value || null;
            const lockerCodeField = customFields.find((f: any) => f.key === 'locker_code');
            const lockerCode = lockerCodeField?.text?.value || null;
            const ticketPasswordField = customFields.find((f: any) => f.key === 'ticket_password');
            const ticketPassword = ticketPasswordField?.text?.value || null;
            const ticketBuyerNameField = customFields.find((f: any) => f.key === 'ticket_buyer_name');
            const ticketBuyerName = ticketBuyerNameField?.text?.value || null;

            const shippingDetails = session.shipping_details || session.collected_information?.shipping_details;
            const customerDetails = session.customer_details || session.collected_information?.customer_details;

            const shippingAddressObj = shippingDetails ? {
                name: shippingDetails.name,
                phone: customerDetails?.phone || null,
                email: customerDetails?.email || null,
                method: shippingMethod,
                locker_code: lockerCode,
                address: {
                    line1: shippingDetails.address?.line1 || null,
                    line2: shippingDetails.address?.line2 || null,
                    city: shippingDetails.address?.city || null,
                    state: shippingDetails.address?.state || null,
                    postal_code: shippingDetails.address?.postal_code || null,
                    country: shippingDetails.address?.country || null,
                }
            } : null;

            // 1. Find the order by order_id (from metadata) or by stripe_session_id
            const orderId = session.metadata?.order_id;
            let dbOrder = null;

            if (orderId) {
                const { data } = await supabaseAdmin
                    .from('orders')
                    .select('*')
                    .eq('id', orderId)
                    .maybeSingle();
                dbOrder = data;
            }

            if (!dbOrder) {
                // Fallback: search by stripe_session_id
                const { data } = await supabaseAdmin
                    .from('orders')
                    .select('*')
                    .eq('stripe_session_id', session.id)
                    .maybeSingle();
                dbOrder = data;
            }

            if (dbOrder) {
                // Try RPC first (bypasses RLS if defined with SECURITY DEFINER)
                const { error: updateErr } = await supabaseAdmin
                    .rpc('update_order_to_paid', {
                        order_id: dbOrder.id,
                        email: customerDetails?.email || dbOrder.customer_email,
                        address: shippingAddressObj
                    });

                if (updateErr) {
                    console.log(`[Webhook] RPC update order to paid failed, falling back to direct update: ${updateErr.message}`);
                    const { error: directUpdateErr } = await supabaseAdmin
                        .from('orders')
                        .update({
                            status: 'paid',
                            customer_email: customerDetails?.email || dbOrder.customer_email,
                            shipping_address: shippingAddressObj
                        })
                        .eq('id', dbOrder.id);
                    if (directUpdateErr) throw directUpdateErr;
                    console.log(`[Webhook] Order ${dbOrder.id} updated to PAID via direct update fallback`);
                } else {
                    console.log(`[Webhook] Order ${dbOrder.id} updated to PAID via RPC`);
                }
                
                // Update ticket info
                if (ticketPassword || ticketBuyerName) {
                    const { error: ticketUpdateErr } = await supabaseAdmin
                        .from('orders')
                        .update({
                            ticket_password: ticketPassword,
                            ticket_buyer_name: ticketBuyerName
                        })
                        .eq('id', dbOrder.id);
                    if (ticketUpdateErr) console.error('[Webhook] Failed to update ticket info:', ticketUpdateErr.message);
                }

                // Note: Stock decrement is handled automatically via public.handle_order_stock_change database trigger.
                // Fail-safe / fallback: Decrement stock directly in Node code in case the database trigger is not installed or failed.
                try {
                    const items = dbOrder.items || [];
                    for (const item of items) {
                        if (item.id && item.quantity > 0) {
                            const { data: prod } = await supabaseAdmin
                                .from('products')
                                .select('stock')
                                .eq('id', item.id)
                                .maybeSingle();
                            if (prod && prod.stock !== null) {
                                const newStock = Math.max(0, prod.stock - item.quantity);
                                await supabaseAdmin
                                    .from('products')
                                    .update({ stock: newStock })
                                    .eq('id', item.id);
                                console.log(`[Webhook Failsafe] Decremented stock for product ${item.id} from ${prod.stock} to ${newStock}`);
                            }
                        }
                    }
                } catch (stockErr: any) {
                    console.error('[Webhook Stock Decrement Error]', stockErr.message);
                }
            } else {
                // Fallback/Safety: If for some reason the order doesn't exist, we create a new one on the fly
                // Fetch line items from Stripe to store in our orders DB
                const stripe = getStripe();
                const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
                const items = lineItems.data.map(item => ({
                    title: item.description,
                    quantity: item.quantity,
                    price: (item.price?.unit_amount || 0) / 100
                }));

                const { data: newOrder, error: insertErr } = await supabaseAdmin
                    .from('orders')
                    .insert({
                        customer_email: customerDetails?.email || 'unknown@example.com',
                        total_amount: (session.amount_total || 0) / 100,
                        status: 'paid',
                        stripe_session_id: session.id,
                        items: items,
                        shipping_address: shippingAddressObj,
                        ticket_password: ticketPassword,
                        ticket_buyer_name: ticketBuyerName
                    })
                    .select('id')
                    .single();
                if (insertErr) throw insertErr;
                console.log(`[Webhook] Order ${session.id} created on-the-fly as PAID`);

                // Insert into order_items and decrement stock
                if (newOrder) {
                    const orderItemsToInsert = [];
                    for (const item of items) {
                        const { data: prod } = await supabaseAdmin
                            .from('products')
                            .select('id, purchase_price, stock')
                            .eq('title', item.title)
                            .maybeSingle();

                        orderItemsToInsert.push({
                            order_id: newOrder.id,
                            product_id: prod?.id || null,
                            product_name: item.title,
                            price_sold: item.price,
                            purchase_price: prod?.purchase_price || 0.00,
                            quantity: item.quantity
                        });

                        // Decrement stock in Node code
                        const itemQty = Number(item.quantity || 1);
                        if (prod && prod.stock !== null && itemQty > 0) {
                            const newStock = Math.max(0, prod.stock - itemQty);
                            await supabaseAdmin
                                .from('products')
                                .update({ stock: newStock })
                                .eq('id', prod.id);
                            console.log(`[Webhook Fallback] Decremented stock for product ${prod.id} from ${prod.stock} to ${newStock}`);
                        }
                    }
                    const { error: itemsErr } = await supabaseAdmin
                        .from('order_items')
                        .insert(orderItemsToInsert);
                    if (itemsErr) {
                        console.error('[Webhook] order_items insert error:', itemsErr);
                    }
                }
            }
        } catch (err: any) {
            console.error('[Webhook Processing Error]', err.message);
        }
    }

    if (event.type === 'checkout.session.expired' || event.type === 'payment_intent.payment_failed') {
        const session = event.data.object as any;
        const orderId = session.metadata?.order_id;
        const sessionId = session.id;

        try {
            let dbOrder = null;
            if (orderId) {
                const { data } = await supabaseAdmin
                    .from('orders')
                    .select('*')
                    .eq('id', orderId)
                    .maybeSingle();
                dbOrder = data;
            }
            if (!dbOrder && sessionId) {
                const { data } = await supabaseAdmin
                    .from('orders')
                    .select('*')
                    .eq('stripe_session_id', sessionId)
                    .maybeSingle();
                dbOrder = data;
            }

            if (dbOrder && (dbOrder.status === 'pending' || dbOrder.status === 'created')) {
                // Mark order as cancelled
                await supabaseAdmin
                    .from('orders')
                    .update({ status: 'cancelled' })
                    .eq('id', dbOrder.id);

                // Return reserved stock to products
                const items = dbOrder.items || [];
                for (const item of items) {
                    let prodId = item.id;
                    if (!prodId && item.slug) {
                        const { data: p } = await supabaseAdmin.from('products').select('id').eq('slug', item.slug).maybeSingle();
                        prodId = p?.id;
                    }
                    if (!prodId && item.title) {
                        const { data: p } = await supabaseAdmin.from('products').select('id').eq('title', item.title).maybeSingle();
                        prodId = p?.id;
                    }

                    if (prodId && item.quantity > 0) {
                        const { data: prod } = await supabaseAdmin
                            .from('products')
                            .select('stock')
                            .eq('id', prodId)
                            .maybeSingle();

                        if (prod && prod.stock !== null) {
                            const newStock = prod.stock + item.quantity;
                            await supabaseAdmin
                                .from('products')
                                .update({ stock: newStock })
                                .eq('id', prodId);
                            console.log(`[Webhook Stock Restoration] Restored stock for product ${prodId} from ${prod.stock} to ${newStock}`);
                        }
                    }
                }
            }
        } catch (restoreErr: any) {
            console.error('[Webhook Stock Restoration Error]', restoreErr.message);
        }
    }

    return NextResponse.json({ received: true });
}
