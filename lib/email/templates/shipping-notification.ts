import type { Order, OrderItem } from "@/types/database";

interface ShippingNotificationData {
  order: Order & { order_number: string };
  items: OrderItem[];
  customerName: string;
  trackingCode?: string | null | undefined;
  trackingUrl?: string | null | undefined;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://armeriapalmetto.it";

export function generateShippingNotificationHtml(data: ShippingNotificationData): string {
  const { order, items, customerName, trackingCode, trackingUrl } = data;

  const itemRows = items
    .map(
      (item) =>
        `<tr>
          <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#374151;">
            ${item.product_name}${item.variant_name ? ` — ${item.variant_name}` : ""}
          </td>
          <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#374151;text-align:center;">${item.quantity}</td>
          <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#374151;text-align:right;">&euro;${item.total_price.toFixed(2)}</td>
        </tr>`
    )
    .join("");

  const trackingBlock = trackingCode
    ? `<div style="background:#eff6ff;border:1px solid #bfdbfe;padding:16px;border-radius:8px;margin:20px 0;">
        <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#1e40af;">📦 Codice di tracking</p>
        <p style="margin:0;font-size:16px;font-weight:700;color:#1e40af;letter-spacing:1px;">${trackingCode}</p>
        ${trackingUrl ? `<p style="margin:8px 0 0;"><a href="${trackingUrl}" style="color:#1d4ed8;font-size:13px;">Traccia il tuo pacco →</a></p>` : ""}
      </div>`
    : `<p style="font-size:14px;color:#6b7280;margin:16px 0;">Il corriere ti contatterà per la consegna. Stima: 3-5 giorni lavorativi.</p>`;

  return `<!DOCTYPE html>
<html lang="it">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;max-width:100%;">

        <tr>
          <td style="background:#7f1d1d;padding:24px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:24px;">Armeria Palmetto</h1>
          </td>
        </tr>

        <tr>
          <td style="padding:32px 24px;">
            <h2 style="margin:0 0 8px;color:#111827;font-size:20px;">Il tuo ordine è stato spedito! 🚚</h2>
            <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">Ciao ${customerName}, il tuo ordine <strong>#${order.order_number}</strong> è partito.</p>

            ${trackingBlock}

            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <thead>
                <tr style="background:#f9fafb;">
                  <th style="padding:10px 8px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;">Prodotto</th>
                  <th style="padding:10px 8px;text-align:center;font-size:12px;color:#6b7280;text-transform:uppercase;">Qtà</th>
                  <th style="padding:10px 8px;text-align:right;font-size:12px;color:#6b7280;text-transform:uppercase;">Totale</th>
                </tr>
              </thead>
              <tbody>${itemRows}</tbody>
            </table>

            <div style="text-align:center;margin-top:32px;">
              <a href="${siteUrl}/account" style="display:inline-block;background:#7f1d1d;color:#fff;padding:12px 32px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;">Il mio account</a>
            </div>
          </td>
        </tr>

        <tr>
          <td style="background:#f9fafb;padding:24px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">Armeria Palmetto — Via Oberdan 70, 25121 Brescia (BS)</p>
            <p style="margin:4px 0 0;font-size:12px;color:#9ca3af;"><a href="${siteUrl}/privacy-policy" style="color:#9ca3af;">Privacy Policy</a></p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
