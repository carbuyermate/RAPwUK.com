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
        const session = event.data.object as Stripe.Checkout.Session;

        try {
            const stripe = getStripe();
            // Fetch line items from Stripe to store in our orders DB
            const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
            const items = lineItems.data.map(item => ({
                title: item.description,
                quantity: item.quantity,
                price: (item.price?.unit_amount || 0) / 100
            }));

            // Check if the order already exists
            const { data: existingOrder } = await supabaseAdmin
                .from('orders')
                .select('id')
                .eq('stripe_session_id', session.id)
                .maybeSingle();

            if (existingOrder) {
                // If it exists, update it to paid
                const { error } = await supabaseAdmin
                    .from('orders')
                    .update({ status: 'paid' })
                    .eq('stripe_session_id', session.id);
                if (error) throw error;
                console.log(`[Webhook] Order ${session.id} updated to PAID`);
            } else {
                // If it doesn't exist, insert the completed order directly
                const { error } = await supabaseAdmin
                    .from('orders')
                    .insert({
                        customer_email: session.customer_details?.email || 'unknown@example.com',
                        total_amount: (session.amount_total || 0) / 100,
                        status: 'paid',
                        stripe_session_id: session.id,
                        items: items
                    });
                if (error) throw error;
                console.log(`[Webhook] Order ${session.id} created as PAID`);
            }
        } catch (err: any) {
            console.error('[Webhook Processing Error]', err.message);
        }
    }

    return NextResponse.json({ received: true });
}
