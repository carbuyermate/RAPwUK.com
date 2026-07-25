import Link from 'next/link';
import { ShoppingBag, Tag, ArrowRight } from 'lucide-react';
import './shop-widget.css';

export interface ShopWidgetProduct {
    id: string;
    slug: string;
    title: string;
    price: number;
    image_url?: string | null;
    category?: string | null;
}

interface ShopWidgetProps {
    product: ShopWidgetProduct | null;
}

export function ShopWidget({ product }: ShopWidgetProps) {
    if (!product) {
        return (
            <div className="shop-widget glass-panel">
                <div className="shop-widget__header">
                    <div className="flex items-center gap-2">
                        <ShoppingBag size={16} style={{ color: '#f59e0b' }} />
                        <span className="shop-widget__label">RAPwUK SHOP</span>
                    </div>
                </div>
                <p className="shop-widget__empty">Odwiedź nasz oficjalny sklep muzyczny!</p>
                <Link href="/shop" className="shop-widget__btn">
                    Przeglądaj sklep <ArrowRight size={14} />
                </Link>
            </div>
        );
    }

    return (
        <div className="shop-widget glass-panel">
            <div className="shop-widget__header">
                <div className="shop-widget__title-wrap">
                    <ShoppingBag size={16} style={{ color: '#f59e0b' }} />
                    <span className="shop-widget__label">SKLEP</span>
                </div>
                <span className="shop-widget__badge">SKLEP</span>
            </div>

            <Link href={`/shop/product/${product.slug}`} className="shop-widget__card">
                {product.image_url ? (
                    <div className="shop-widget__image-wrap">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={product.image_url} alt={product.title} />
                    </div>
                ) : (
                    <div className="shop-widget__image-placeholder">
                        <Tag size={32} style={{ opacity: 0.3, color: '#f59e0b' }} />
                    </div>
                )}

                <div className="shop-widget__body">
                    {product.category && (
                        <span className="shop-widget__category">{product.category}</span>
                    )}
                    <h4 className="shop-widget__title">{product.title}</h4>
                    <div className="shop-widget__footer">
                        <span className="shop-widget__price">£{product.price.toFixed(2)}</span>
                        <span className="shop-widget__cta">
                            KUP TERAZ <ArrowRight size={12} />
                        </span>
                    </div>
                </div>
            </Link>
        </div>
    );
}
