import { type NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return new NextResponse(
      `<!DOCTYPE html><html lang="it"><head><meta charset="utf-8"/><title>Disiscrizione</title></head>
      <body style="font-family:Arial,sans-serif;max-width:500px;margin:80px auto;text-align:center;">
        <h1 style="color:#7f1d1d;">Errore</h1>
        <p>Parametro email mancante. Usa il link presente nella email di disiscrizione.</p>
      </body></html>`,
      { headers: { "Content-Type": "text/html; charset=utf-8" }, status: 400 }
    );
  }

  const supabase = createAdminClient();
  await supabase
    .from("newsletter_subscribers")
    .update({ is_active: false, unsubscribed_at: new Date().toISOString() })
    .eq("email", email);

  return new NextResponse(
    `<!DOCTYPE html><html lang="it"><head><meta charset="utf-8"/><title>Disiscrizione</title></head>
    <body style="font-family:Arial,sans-serif;max-width:500px;margin:80px auto;text-align:center;">
      <h1 style="color:#7f1d1d;">Ti sei disiscritto con successo</h1>
      <p style="color:#6b7280;">L&apos;indirizzo <strong>${email}</strong> &egrave; stato rimosso dalla nostra newsletter.</p>
      <p style="color:#6b7280;font-size:13px;">Se cambi idea, puoi iscriverti nuovamente dal sito.</p>
      <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://armeriapalmetto.it"}" style="display:inline-block;margin-top:24px;background-color:#7f1d1d;color:#fff;padding:10px 24px;border-radius:6px;text-decoration:none;font-size:14px;">Torna al sito</a>
    </body></html>`,
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}
