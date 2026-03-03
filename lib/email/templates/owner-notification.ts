import type { Order, OrderItem } from "@/types/database";

interface OwnerNotificationData {
  order: Order & { order_number: string };
  items: OrderItem[];
  customerName: string;
  customerPhone?: string | undefined;
  adminUrl: string;
}

const STORE_PHONE = "+39 030 370 0800";

export function generateOwnerNotificationHtml(data: OwnerNotificationData): string {
  const { order, items, customerName, customerPhone, adminUrl } = data;

  const isPickup = !!order.requires_pickup;
  const shippingAddress = order.shipping_address as Record<string, string> | null;

  const itemRows = items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px;font-size:14px;border-bottom:1px solid #e5e7eb;">${item.product_name}${item.variant_name ? ` — ${item.variant_name}` : ""}</td>
          <td style="padding:8px;font-size:14px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
          <td style="padding:8px;font-size:14px;border-bottom:1px solid #e5e7eb;text-align:right;">&euro;${item.total_price.toFixed(2)}</td>
        </tr>`
    )
    .join("");

  const pickupBlock = isPickup
    ? `<div style="background:#7f1d1d;color:#fff;padding:16px;border-radius:8px;margin:16px 0;">
        <p style="margin:0 0 6px;font-size:15px;font-weight:700;">⚠️ RITIRO IN NEGOZIO</p>
        <p style="margin:0 0 4px;font-size:13px;">Documento: <strong>${order.pickup_document_type ?? "—"}</strong></p>
        <p style="margin:0;font-size:13px;">N. documento: <strong>${order.pickup_document_number ?? "—"}</strong></p>
      </div>`
    : `<div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:12px;border-radius:8px;margin:16px 0;">
        <p style="margin:0;font-size:13px;color:#166534;">📦 Spedizione a: ${shippingAddress?.street ?? ""}, ${shippingAddress?.city ?? ""} ${shippingAddress?.zip ?? ""}</p>
      </div>`;

  return `<!DOCTYPE html>
<html lang="it">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:24px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;max-width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#7f1d1d;padding:20px 24px;">
            <p style="margin:0;color:#fca5a5;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Armeria Palmetto — Admin</p>
            <h1 style="margin:4px 0 0;color:#fff;font-size:22px;">🛍️ Nuovo ordine #${order.order_number}</h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:24px;">

            <!-- Customer info -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;background:#f9fafb;border-radius:6px;padding:12px;">
              <tr>
                <td style="padding:4px 8px;font-size:13px;color:#6b7280;width:110px;">Cliente</td>
                <td style="padding:4px 8px;font-size:14px;font-weight:600;color:#111827;">${customerName}</td>
              </tr>
              <tr>
                <td style="padding:4px 8px;font-size:13px;color:#6b7280;">Email</td>
                <td style="padding:4px 8px;font-size:14px;color:#111827;">${order.email}</td>
              </tr>
              ${customerPhone ? `<tr><td style="padding:4px 8px;font-size:13px;color:#6b7280;">Telefono</td><td style="padding:4px 8px;font-size:14px;color:#111827;">${customerPhone}</td></tr>` : ""}
            </table>

            ${pickupBlock}

            <!-- Items -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
              <thead>
                <tr style="background:#f9fafb;">
                  <th style="padding:8px;font-size:12px;color:#6b7280;text-align:left;">Prodotto</th>
                  <th style="padding:8px;font-size:12px;color:#6b7280;text-align:center;">Qtà</th>
                  <th style="padding:8px;font-size:12px;color:#6b7280;text-align:right;">Totale</th>
                </tr>
              </thead>
              <tbody>${itemRows}</tbody>
            </table>

            <!-- Total -->
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr>
                <td style="padding:8px;font-size:16px;font-weight:700;color:#111827;border-top:2px solid #e5e7eb;">TOTALE</td>
                <td style="padding:8px;font-size:16px;font-weight:700;color:#7f1d1d;text-align:right;border-top:2px solid #e5e7eb;">&euro;${order.total.toFixed(2)}</td>
              </tr>
            </table>

            <!-- CTA -->
            <div style="text-align:center;">
              <a href="${adminUrl}" style="display:inline-block;background:#7f1d1d;color:#fff;padding:12px 32px;border-radius:6px;text-decoration:none;font-size:15px;font-weight:700;">
                Gestisci ordine →
              </a>
            </div>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:16px 24px;text-align:center;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">Armeria Palmetto — ${STORE_PHONE}</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
