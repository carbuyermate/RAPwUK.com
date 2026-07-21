import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://rapwuk.com';

  // ── Strony statyczne ──────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl,                           lastModified: new Date(), changeFrequency: 'daily',  priority: 1.0 },
    { url: `${baseUrl}/news`,                 lastModified: new Date(), changeFrequency: 'daily',  priority: 0.9 },
    { url: `${baseUrl}/events`,               lastModified: new Date(), changeFrequency: 'daily',  priority: 0.9 },
    { url: `${baseUrl}/rappers`,              lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/shop`,                 lastModified: new Date(), changeFrequency: 'daily',  priority: 0.9 },
    { url: `${baseUrl}/shop/muzyka`,          lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/shop/ubrania`,         lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/shop/bilety`,          lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/shop/gielda`,          lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/contact`,              lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/dostawa`,              lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/regulamin`,            lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    { url: `${baseUrl}/zwroty-i-reklamacje`,  lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    { url: `${baseUrl}/polityka-prywatnosci`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
  ];

  // ── Pobierz newsy ──────────────────────────────────────────────
  let newsUrls: MetadataRoute.Sitemap = [];
  try {
    const { data: newsItems } = await supabase
      .from('news')
      .select('slug, id, created_at')
      .order('created_at', { ascending: false });
    newsUrls = (newsItems || []).map((item) => ({
      url: `${baseUrl}/news/${item.slug || item.id}`,
      lastModified: new Date(item.created_at),
      changeFrequency: 'monthly',
      priority: 0.7,
    }));
  } catch {
    // Jeśli Supabase nie odpowiada, sitemap nadal zwraca strony statyczne
  }

  // ── Pobierz imprezy ────────────────────────────────────────────
  let eventUrls: MetadataRoute.Sitemap = [];
  try {
    const { data: events } = await supabase
      .from('events')
      .select('slug, id, event_date')
      .order('event_date', { ascending: false });
    eventUrls = (events || []).map((event) => ({
      url: `${baseUrl}/events/${event.slug || event.id}`,
      lastModified: new Date(event.event_date),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  } catch { /* fallback */ }

  // ── Pobierz artystów (scena) ───────────────────────────────────
  let rapperUrls: MetadataRoute.Sitemap = [];
  try {
    const { data: rappers } = await supabase
      .from('rappers')
      .select('slug, id');
    rapperUrls = (rappers || []).map((rapper) => ({
      url: `${baseUrl}/rappers/${rapper.slug || rapper.id}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    }));
  } catch { /* fallback */ }

  // ── Pobierz produkty ze sklepu ─────────────────────────────────
  let productUrls: MetadataRoute.Sitemap = [];
  try {
    const { data: products } = await supabase
      .from('products')
      .select('slug, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    productUrls = (products || []).map((product) => ({
      url: `${baseUrl}/shop/product/${product.slug}`,
      lastModified: product.created_at ? new Date(product.created_at) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  } catch { /* fallback */ }

  return [...staticPages, ...newsUrls, ...eventUrls, ...rapperUrls, ...productUrls];
}
