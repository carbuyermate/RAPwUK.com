import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function GET(req: NextRequest) {
    try {
        // Fetch all active/paid/pending orders
        const { data: orders, error: ordersErr } = await supabaseAdmin
            .from('orders')
            .select('*')
            .in('status', ['paid', 'shipped', 'processing', 'pending', 'completed']);

        if (ordersErr) {
            return NextResponse.json({ error: ordersErr.message }, { status: 500 });
        }

        // Fetch all products
        const { data: products, error: productsErr } = await supabaseAdmin
            .from('products')
            .select('id, title, slug, stock');

        if (productsErr) {
            return NextResponse.json({ error: productsErr.message }, { status: 500 });
        }

        const updates: Array<{ id: string; title: string; previousStock: number; newStock: number; orderedQty: number }> = [];

        // Track how many items have been ordered/paid per product
        const orderedQtyMap = new Map<string, number>();

        for (const order of (orders || [])) {
            const items = order.items || [];
            for (const item of items) {
                const qty = Number(item.quantity || 1);
                
                // Match product by ID, slug or title
                let matchedProduct = (products || []).find(p => p.id === item.id);
                if (!matchedProduct && item.slug) {
                    matchedProduct = (products || []).find(p => p.slug === item.slug);
                }
                if (!matchedProduct && item.title) {
                    matchedProduct = (products || []).find(p => p.title.toLowerCase().trim() === String(item.title).toLowerCase().trim());
                }

                if (matchedProduct) {
                    const currentTotal = orderedQtyMap.get(matchedProduct.id) || 0;
                    orderedQtyMap.set(matchedProduct.id, currentTotal + qty);
                }
            }
        }

        // Update product stock if needed
        for (const prod of (products || [])) {
            const orderedQty = orderedQtyMap.get(prod.id) || 0;

            // If product had 1 in stock and 1+ ordered, stock should be 0
            if (orderedQty > 0) {
                // Determine new stock
                const targetStock = Math.max(0, prod.stock - orderedQty);

                if (prod.stock !== targetStock) {
                    const { error: rpcErr } = await supabaseAdmin.rpc('decrement_product_stock', {
                        product_id: prod.id,
                        qty: orderedQty
                    });

                    if (rpcErr) {
                        await supabaseAdmin
                            .from('products')
                            .update({ stock: targetStock })
                            .eq('id', prod.id);
                    }

                    updates.push({
                        id: prod.id,
                        title: prod.title,
                        previousStock: prod.stock,
                        newStock: targetStock,
                        orderedQty: orderedQty
                    });
                }
            }
        }

        return NextResponse.json({
            success: true,
            totalOrdersProcessed: (orders || []).length,
            updatedProductsCount: updates.length,
            updates: updates
        });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
