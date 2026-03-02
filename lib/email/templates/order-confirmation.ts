import type { Order, OrderItem } from "@/types/database";

interface OrderConfirmationData {
  order: Order;
  items: OrderItem[];
  customerName: string;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://armeriapalmetto.it";

export function generateOrderConfirmationHtml(data: OrderConfirmationData): string {
  const { order, items, customerName } = data;

  const itemRows = items
    .map(
      (item) => `
        <tr>
          <td style="padding:12px 8px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#374151;">
            ${item.product_name}${item.variant_name ? ` — ${item.variant_name}` : ""}
          </td>
          <td style="padding:12px 8px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#374151;text-align:center;">
            ${item.quantity}
          </td>
          <td style="padding:12px 8px;border-bottom:1px solid #e5e7eb;font-size:14px;color:#374151;text-align:right;">
            &euro;${item.total_price.toFixed(2)}
          </td>
        </tr>`
    )
    .join("");

  const shippingAddress = order.shipping_address as Record<string, string> | null;
  const addressBlock = shippingAddress
    ? `<p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">
        ${shippingAddress.full_name ?? ""}<br/>
        ${shippingAddress.street ?? ""}<br/>
        ${shippingAddress.postal_code ?? ""} ${shippingAddress.city ?? ""} (${shippingAddress.province ?? ""})<br/>
        ${shippingAddress.country ?? "Italia"}
      </p>`
    : "";

  return `<!DOCTYPE html>
<html lang="it">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;max-width:100%;">

        <!-- Header -->
        <tr>
          <td style="background-color:#7f1d1d;padding:24px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">Armeria Palmetto</h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px 24px;">
            <h2 style="margin:0 0 8px;color:#111827;font-size:20px;">Grazie per il tuo ordine!</h2>
            <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">Ciao ${customerName}, il tuo ordine <strong>#${order.order_number}</strong> &egrave; stato ricevuto.</p>

            <!-- Items -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <thead>
                <tr style="background-color:#f9fafb;">
                  <th style="padding:10px 8px;text-align:left;font-size:12px;color:#6b7280;text-transform:uppercase;">Prodotto</th>
                  <th style="padding:10px 8px;text-align:center;font-size:12px;color:#6b7280;text-transform:uppercase;">Qt&agrave;</th>
                  <th style="padding:10px 8px;text-align:right;font-size:12px;color:#6b7280;text-transform:uppercase;">Totale</th>
                </tr>
              </thead>
              <tbody>${itemRows}</tbody>
            </table>

            <!-- Totals -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td style="padding:4px 8px;font-size:14px;color:#374151;">Subtotale</td>
                <td style="padding:4px 8px;font-size:14px;color:#374151;text-align:right;">&euro;${order.subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding:4px 8px;font-size:14px;color:#374151;">Spedizione</td>
                <td style="padding:4px 8px;font-size:14px;color:#374151;text-align:right;">&euro;${order.shipping.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding:4px 8px;font-size:14px;color:#374151;">IVA</td>
                <td style="padding:4px 8px;font-size:14px;color:#374151;text-align:right;">&euro;${order.tax.toFixed(2)}</td>
              </tr>
              ${order.discount > 0 ? `<tr><td style="padding:4px 8px;font-size:14px;color:#059669;">Sconto</td><td style="padding:4px 8px;font-size:14px;color:#059669;text-align:right;">-&euro;${order.discount.toFixed(2)}</td></tr>` : ""}
              <tr>
                <td style="padding:8px;font-size:16px;font-weight:700;color:#111827;border-top:2px solid #e5e7eb;">Totale</td>
                <td style="padding:8px;font-size:16px;font-weight:700;color:#111827;text-align:right;border-top:2px solid #e5e7eb;">&euro;${order.total.toFixed(2)}</td>
              </tr>
            </table>

            ${shippingAddress ? `<h3 style="margin:0 0 8px;font-size:14px;color:#111827;">Indirizzo di spedizione</h3>${addressBlock}` : ""}

            <div style="text-align:center;margin-top:32px;">
              <a href="${siteUrl}" style="display:inline-block;background-color:#7f1d1d;color:#ffffff;padding:12px 32px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;">Visita il sito</a>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background-color:#f9fafb;padding:24px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0 0 4px;font-size:12px;color:#9ca3af;">Armeria Palmetto — Brescia</p>
            <p style="margin:0 0 4px;font-size:12px;color:#9ca3af;">P.IVA: 00000000000</p>
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              <a href="${siteUrl}/privacy-policy" style="color:#9ca3af;">Privacy Policy</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
