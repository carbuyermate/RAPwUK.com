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

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(req: NextRequest) {
    try {
        const { items } = await req.json();

        if (!items || items.length === 0) {
            return NextResponse.json({ error: 'Koszyk jest pusty' }, { status: 400 });
        }

        // Check live database stock and price for each item
        const verifiedItems = [];
        for (const item of items) {
            const { data: product } = await supabaseAdmin
                .from('products')
                .select('stock, title, price, category, slug, purchase_price')
                .eq('id', item.id)
                .maybeSingle();

            if (!product) {
                return NextResponse.json({ error: `Produkt "${item.title}" nie istnieje w bazie` }, { status: 400 });
            }

            if (product.stock === null || product.stock === 0) {
                return NextResponse.json({ error: `Produkt "${product.title}" jest chwilowo niedostępny` }, { status: 400 });
            }

            if (item.quantity > product.stock) {
                return NextResponse.json({ 
                    error: `Maksymalna dostępna ilość dla "${product.title}" to ${product.stock} szt. Zmniejsz ilość w koszyku.` 
                }, { status: 400 });
            }

            verifiedItems.push({
                id: item.id,
                title: product.title,
                price: Number(product.price),
                purchase_price: Number(product.purchase_price || 0),
                quantity: item.quantity,
                category: product.category,
                slug: product.slug,
                image_url: item.image_url // image URL is safe to pass from client for display
            });
        }

        const line_items = verifiedItems.map((item: { title: string; price: number; quantity: number; image_url?: string }) => ({
            price_data: {
                currency: 'gbp',
                product_data: {
                    name: item.title,
                    ...(item.image_url ? { images: [item.image_url] } : {}),
                },
                unit_amount: Math.round(item.price * 100), // Stripe uses pence (cents)
            },
            quantity: item.quantity,
        }));

        // Calculate InPost UK Shipping: £3 for first physical item, +£1 for each additional
        const physicalItems = verifiedItems.filter((item: { category: string; quantity: number }) => item.category !== 'bilety');
        const physicalQty = physicalItems.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0);
        const shippingCost = physicalQty > 0 ? (3.00 + (physicalQty - 1) * 1.00) : 0;

        if (shippingCost > 0) {
            line_items.push({
                price_data: {
                    currency: 'gbp',
                    product_data: {
                        name: 'Wysyłka (InPost UK)',
                    },
                    unit_amount: Math.round(shippingCost * 100),
                },
                quantity: 1,
            });
        }

        // Calculate total amount
        const productsPrice = verifiedItems.reduce((sum: number, item: { price: number; quantity: number }) => sum + (item.price * item.quantity), 0);
        const totalAmount = productsPrice + shippingCost;

        // Clean items array to ensure it only has standard properties we want to store
        const dbItems = verifiedItems.map((item: any) => ({
            id: item.id,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            category: item.category || null,
            slug: item.slug || null
        }));

        // Pre-create pending order in Supabase
        const { data: order, error: orderErr } = await supabaseAdmin
            .from('orders')
            .insert({
                customer_email: 'pending@example.com',
                total_amount: totalAmount,
                status: 'pending',
                items: dbItems,
            })
            .select('id')
            .single();

        if (orderErr) {
            console.error('[Checkout DB Error]', orderErr);
            throw new Error(`Błąd bazy danych: ${orderErr.message}`);
        }

        // Insert into order_items
        const orderItemsToInsert = verifiedItems.map(item => ({
            order_id: order.id,
            product_id: item.id,
            product_name: item.title,
            price_sold: item.price,
            purchase_price: item.purchase_price,
            quantity: item.quantity
        }));

        const { error: itemsErr } = await supabaseAdmin
            .from('order_items')
            .insert(orderItemsToInsert);

        if (itemsErr) {
            console.error('[Checkout order_items Error]', itemsErr);
        }

        const stripe = getStripe();
        const sessionOptions: Stripe.Checkout.SessionCreateParams = {
            payment_method_types: ['card'],
            line_items,
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/shop/cart`,
            billing_address_collection: 'required',
            metadata: {
                order_id: order.id,
            },
        };

        if (physicalQty > 0) {
            sessionOptions.shipping_address_collection = {
                allowed_countries: ['GB', 'PL', 'DE', 'FR', 'NL', 'IE'],
            };
            sessionOptions.phone_number_collection = {
                enabled: true,
            };
            sessionOptions.custom_fields = [
                {
                    key: 'shipping_method',
                    label: {
                        type: 'custom',
                        custom: 'Metoda dostawy / Delivery Method',
                    },
                    type: 'dropdown',
                    dropdown: {
                        options: [
                            { label: 'Adres domowy (Home Delivery)', value: 'home' },
                            { label: 'Paczkomat (InPost Locker)', value: 'locker' },
                        ],
                    },
                },
                {
                    key: 'locker_code',
                    label: {
                        type: 'custom',
                        custom: 'Kod paczkomatu (np. UK12345) / Locker Code',
                    },
                    type: 'text',
                    optional: true,
                },
            ];
        }

        const session = await stripe.checkout.sessions.create(sessionOptions);

        // Update order in Supabase with the stripe_session_id
        const { error: updateErr } = await supabaseAdmin
            .from('orders')
            .update({ stripe_session_id: session.id })
            .eq('id', order.id);

        if (updateErr) {
            console.error('[Checkout DB Update Error]', updateErr);
        }

        return NextResponse.json({ url: session.url });
    } catch (err: any) {
        console.error('[Checkout API Error]', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
