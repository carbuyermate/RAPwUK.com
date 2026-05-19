import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-04-30.basil',
});

// Use service role key to bypass RLS when updating orders
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = req.headers.get('stripe-signature')!;

    let event: Stripe.Event;

    try {
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

        // Mark the order as paid in Supabase
        const { error } = await supabaseAdmin
            .from('orders')
            .update({ status: 'paid' })
            .eq('stripe_session_id', session.id);

        if (error) {
            console.error('[Webhook DB Error]', error);
        } else {
            console.log(`[Webhook] Order ${session.id} marked as PAID`);
        }
    }

    return NextResponse.json({ received: true });
}
