import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface OrderItem {
    title: string;
    quantity: number;
    price: number;
}

export interface ShippingAddress {
    name?: string;
    email?: string;
    phone?: string;
    method?: string;
    locker_code?: string;
    address?: {
        line1?: string;
        line2?: string;
        city?: string;
        state?: string;
        postal_code?: string;
        country?: string;
    };
}

export interface OrderEmailData {
    orderId: string;
    customerEmail: string;
    items: OrderItem[];
    totalAmount: number;
    shippingAddress?: ShippingAddress | null;
    ticketBuyerName?: string | null;
    ticketPassword?: string | null;
}

function formatAddress(addr: ShippingAddress): string {
    const parts = [
        addr.name,
        addr.address?.line1,
        addr.address?.line2,
        addr.address?.city,
        addr.address?.postal_code,
        addr.address?.country,
    ].filter(Boolean);
    return parts.join(', ');
}

function buildEmailHtml(data: OrderEmailData): string {
    const { orderId, items, totalAmount, shippingAddress, ticketBuyerName, ticketPassword } = data;

    const hasPhysical = shippingAddress != null;
    const hasTickets = !!(ticketBuyerName || ticketPassword);
    const shortId = orderId.slice(0, 8).toUpperCase();

    const itemsHtml = items.map(item => `
        <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #2a2a3a; color: #e0e0e0; font-size: 15px;">
                ${item.title}${item.quantity > 1 ? ` <span style="color:#aaa;">x${item.quantity}</span>` : ''}
            </td>
            <td style="padding: 10px 0; border-bottom: 1px solid #2a2a3a; text-align: right; color: #e0e0e0; font-size: 15px; white-space: nowrap;">
                £${(item.price * item.quantity).toFixed(2)}
            </td>
        </tr>
    `).join('');

    const ticketSectionHtml = hasTickets ? `
        <div style="background: #1a1a2e; border: 1px solid #f5c518; border-radius: 10px; padding: 20px; margin: 24px 0;">
            <h3 style="margin: 0 0 12px; color: #f5c518; font-size: 16px;">🎟️ Dane biletowe</h3>
            ${ticketBuyerName ? `<p style="margin: 4px 0; color: #e0e0e0;"><strong>Imię i nazwisko:</strong> ${ticketBuyerName}</p>` : ''}
            ${ticketPassword ? `<p style="margin: 4px 0; color: #e0e0e0;"><strong>Hasło na bramce:</strong> <span style="color: #f5c518; font-weight: bold; font-size: 18px;">${ticketPassword}</span></p>` : ''}
            <p style="margin: 12px 0 0; color: #888; font-size: 13px;">Podaj te dane przy wejściu na wydarzenie.</p>
        </div>
    ` : '';

    const shippingHtml = hasPhysical && shippingAddress ? `
        <div style="background: #1a1a2e; border: 1px solid #2a2a3a; border-radius: 10px; padding: 20px; margin: 24px 0;">
            <h3 style="margin: 0 0 12px; color: #e0e0e0; font-size: 16px;">📦 Adres dostawy</h3>
            <p style="margin: 4px 0; color: #ccc; font-size: 14px;">${formatAddress(shippingAddress)}</p>
            ${shippingAddress.phone ? `<p style="margin: 4px 0; color: #ccc; font-size: 14px;">📞 ${shippingAddress.phone}</p>` : ''}
            ${shippingAddress.method === 'locker' && shippingAddress.locker_code
                ? `<p style="margin: 4px 0; color: #ccc; font-size: 14px;">📬 Paczkomat: <strong>${shippingAddress.locker_code}</strong></p>`
                : ''}
        </div>
    ` : '';

    return `
<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Potwierdzenie zamówienia – RAPwUK.com</title>
</head>
<body style="margin: 0; padding: 0; background: #0d0d1a; font-family: 'Segoe UI', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background: #0d0d1a; padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background: #13131f; border-radius: 16px; overflow: hidden; border: 1px solid #2a2a3a;">

                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #1a1a2e 0%, #0d0d1a 100%); padding: 36px 40px; text-align: center; border-bottom: 2px solid #f5c518;">
                            <div style="font-size: 28px; font-weight: 900; letter-spacing: 2px; color: #f5c518;">RAP<span style="color: #ffffff;">w</span>UK<span style="color: #888; font-weight: 400; font-size: 14px;">.com</span></div>
                            <div style="color: #888; font-size: 12px; margin-top: 4px; letter-spacing: 1px;">NAJLEPIEJ O RAPIE NA WYSPACH</div>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding: 36px 40px;">

                            <h1 style="margin: 0 0 8px; color: #ffffff; font-size: 24px; font-weight: 800;">
                                Dziękujemy za zamówienie! 🎉
                            </h1>
                            <p style="margin: 0 0 24px; color: #888; font-size: 14px;">
                                Numer zamówienia: <strong style="color: #f5c518;">#${shortId}</strong>
                            </p>

                            <!-- Items table -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <thead>
                                    <tr>
                                        <th style="text-align: left; color: #666; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; padding-bottom: 8px; border-bottom: 1px solid #2a2a3a;">Produkt</th>
                                        <th style="text-align: right; color: #666; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; padding-bottom: 8px; border-bottom: 1px solid #2a2a3a;">Kwota</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${itemsHtml}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td style="padding-top: 14px; color: #ffffff; font-weight: 800; font-size: 17px;">Łącznie</td>
                                        <td style="padding-top: 14px; text-align: right; color: #f5c518; font-weight: 800; font-size: 17px;">£${totalAmount.toFixed(2)}</td>
                                    </tr>
                                </tfoot>
                            </table>

                            ${ticketSectionHtml}
                            ${shippingHtml}

                            <p style="color: #888; font-size: 13px; margin-top: 28px; line-height: 1.6;">
                                Masz pytania? Napisz do nas: <a href="mailto:kontakt@rapwuk.com" style="color: #f5c518;">kontakt@rapwuk.com</a>
                            </p>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background: #0d0d1a; padding: 20px 40px; text-align: center; border-top: 1px solid #2a2a3a;">
                            <p style="margin: 0; color: #555; font-size: 12px;">
                                © RAPwUK.com · <a href="https://rapwuk.com" style="color: #555;">rapwuk.com</a>
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();
}

export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<void> {
    const { customerEmail, orderId } = data;
    const shortId = orderId.slice(0, 8).toUpperCase();

    if (!process.env.RESEND_API_KEY) {
        console.error('[Email] RESEND_API_KEY is not set — skipping email send.');
        return;
    }

    if (!customerEmail || customerEmail === 'pending@example.com' || customerEmail === 'unknown@example.com') {
        console.error(`[Email] Invalid customer email "${customerEmail}" — skipping.`);
        return;
    }

    const html = buildEmailHtml(data);

    const { data: result, error } = await resend.emails.send({
        from: 'RAPwUK.com Sklep <zamowienia@rapwuk.com>',
        to: customerEmail,
        subject: `✅ Potwierdzenie zamówienia #${shortId} – RAPwUK.com`,
        html,
    });

    if (error) {
        console.error('[Email] Resend error:', error);
    } else {
        console.log(`[Email] Confirmation sent to ${customerEmail}, id: ${result?.id}`);
    }
}
