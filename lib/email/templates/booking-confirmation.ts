import type { Booking, BookingService } from "@/types/database";

interface BookingConfirmationData {
  booking: Booking;
  service: BookingService;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://armeriapalmetto.it";

export function generateBookingConfirmationHtml(data: BookingConfirmationData): string {
  const { booking, service } = data;

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
            <h2 style="margin:0 0 8px;color:#111827;font-size:20px;">Prenotazione confermata!</h2>
            <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">Ciao ${booking.customer_name}, la tua prenotazione &egrave; stata confermata.</p>

            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;border-radius:8px;padding:20px;margin-bottom:24px;">
              <tr>
                <td style="padding:8px 0;font-size:14px;color:#6b7280;">Servizio</td>
                <td style="padding:8px 0;font-size:14px;color:#111827;font-weight:600;text-align:right;">${service.name}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;font-size:14px;color:#6b7280;">Data</td>
                <td style="padding:8px 0;font-size:14px;color:#111827;font-weight:600;text-align:right;">${booking.booking_date}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;font-size:14px;color:#6b7280;">Orario</td>
                <td style="padding:8px 0;font-size:14px;color:#111827;font-weight:600;text-align:right;">${booking.start_time} — ${booking.end_time}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;font-size:14px;color:#6b7280;">Durata</td>
                <td style="padding:8px 0;font-size:14px;color:#111827;font-weight:600;text-align:right;">${service.duration_minutes} minuti</td>
              </tr>
              <tr>
                <td style="padding:8px 0;font-size:14px;color:#6b7280;">Prezzo</td>
                <td style="padding:8px 0;font-size:14px;color:#111827;font-weight:600;text-align:right;">&euro;${service.price.toFixed(2)}</td>
              </tr>
            </table>

            <h3 style="margin:0 0 8px;font-size:14px;color:#111827;">Indirizzo negozio</h3>
            <p style="margin:0 0 24px;font-size:14px;color:#374151;line-height:1.6;">
              Armeria Palmetto<br/>
              Brescia, Italia
            </p>

            <div style="text-align:center;">
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
