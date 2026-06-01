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
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
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
                // Order exists! Let's update it to paid, set the customer email, and store shipping details
                const { error: updateErr } = await supabaseAdmin
                    .from('orders')
                    .update({
                        status: 'paid',
                        customer_email: customerDetails?.email || dbOrder.customer_email,
                        shipping_address: shippingAddressObj
                    })
                    .eq('id', dbOrder.id);

                if (updateErr) throw updateErr;
                console.log(`[Webhook] Order ${dbOrder.id} updated to PAID`);

                // Decrement stock for the purchased items
                let itemsList = dbOrder.items;
                if (typeof itemsList === 'string') {
                    try {
                        itemsList = JSON.parse(itemsList);
                    } catch (e) {
                        console.error('[Webhook] Failed to parse dbOrder.items string', e);
                        itemsList = [];
                    }
                }

                if (Array.isArray(itemsList)) {
                    for (const item of itemsList) {
                        const productId = item.id;
                        const qty = item.quantity;
                        
                        if (productId && qty > 0) {
                            // Read current stock
                            const { data: product } = await supabaseAdmin
                                .from('products')
                                .select('stock')
                                .eq('id', productId)
                                .maybeSingle();

                            if (product) {
                                const currentStock = product.stock !== null ? product.stock : 0;
                                const newStock = Math.max(0, currentStock - qty);
                                
                                const { error: stockErr } = await supabaseAdmin
                                    .from('products')
                                    .update({ stock: newStock })
                                    .eq('id', productId);
                                    
                                if (stockErr) {
                                    console.error(`[Webhook] Failed to update stock for product ${productId}:`, stockErr.message);
                                } else {
                                    console.log(`[Webhook] Stock for product ${productId} decremented from ${currentStock} to ${newStock}`);
                                }
                            }
                        }
                    }
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

                const { error: insertErr } = await supabaseAdmin
                    .from('orders')
                    .insert({
                        customer_email: customerDetails?.email || 'unknown@example.com',
                        total_amount: (session.amount_total || 0) / 100,
                        status: 'paid',
                        stripe_session_id: session.id,
                        items: items,
                        shipping_address: shippingAddressObj
                    });
                if (insertErr) throw insertErr;
                console.log(`[Webhook] Order ${session.id} created on-the-fly as PAID`);
            }
        } catch (err: any) {
            console.error('[Webhook Processing Error]', err.message);
        }
    }

    return NextResponse.json({ received: true });
}
