interface WelcomeData {
  name: string;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://armeriapalmetto.it";

export function generateWelcomeHtml(data: WelcomeData): string {
  const { name } = data;

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
            <h2 style="margin:0 0 8px;color:#111827;font-size:20px;">Benvenuto in Armeria Palmetto!</h2>
            <p style="margin:0 0 16px;color:#6b7280;font-size:14px;line-height:1.6;">
              Ciao ${name}, siamo felici di averti con noi! Armeria Palmetto &egrave; il tuo punto di riferimento per armi, munizioni e fuochi artificiali a Brescia.
            </p>
            <p style="margin:0 0 32px;color:#6b7280;font-size:14px;line-height:1.6;">
              Esplora il nostro catalogo o prenota un appuntamento nel nostro negozio.
            </p>

            <div style="text-align:center;margin-bottom:16px;">
              <a href="${siteUrl}/products" style="display:inline-block;background-color:#7f1d1d;color:#ffffff;padding:12px 32px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;">Scopri il catalogo</a>
            </div>
            <div style="text-align:center;">
              <a href="${siteUrl}/bookings" style="display:inline-block;background-color:#ffffff;color:#7f1d1d;padding:12px 32px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;border:2px solid #7f1d1d;">Prenota un appuntamento</a>
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
