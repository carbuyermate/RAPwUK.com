import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

function getStripe() {
    const key = (process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder')
        .replace(/\s+/g, '')
        .replace(/^["']|["']$/g, '');
    return new Stripe(key, {
        apiVersion: '2024-06-20',
    });
}

export async function POST(req: NextRequest) {
    try {
        const { items } = await req.json();

        if (!items || items.length === 0) {
            return NextResponse.json({ error: 'Koszyk jest pusty' }, { status: 400 });
        }

        const line_items = items.map((item: { title: string; price: number; quantity: number; image_url?: string }) => ({
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
        const physicalItems = items.filter((item: { category: string; quantity: number }) => item.category !== 'bilety');
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

        const stripe = getStripe();
        const sessionOptions: Stripe.Checkout.SessionCreateParams = {
            payment_method_types: ['card'],
            line_items,
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL}/shop/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/shop/cart`,
            billing_address_collection: 'required',
        };

        if (physicalQty > 0) {
            sessionOptions.shipping_address_collection = {
                allowed_countries: ['GB', 'PL', 'DE', 'FR', 'NL', 'IE'],
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

        return NextResponse.json({ url: session.url });
    } catch (err: any) {
        console.error('[Checkout API Error]', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
