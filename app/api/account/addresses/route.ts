import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/utils/logger";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    // Check max 5
    const { count } = await supabase
      .from("addresses")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if ((count ?? 0) >= 5) {
      return NextResponse.json({ error: "Massimo 5 indirizzi consentiti" }, { status: 400 });
    }

    const body = await request.json();
    const { label, full_name, phone, street, city, province, postal_code, country } = body as Record<string, string>;

    if (!label || !full_name || !street || !city || !province || !postal_code || !country) {
      return NextResponse.json({ error: "Compila tutti i campi obbligatori" }, { status: 400 });
    }

    const isFirst = (count ?? 0) === 0;

    const { error } = await supabase.from("addresses").insert({
      user_id: user.id,
      label,
      full_name,
      phone: phone || null,
      street,
      city,
      province,
      postal_code,
      country,
      is_default: isFirst,
    });

    if (error) {
      logger.error("Address insert failed", { error: error.message });
      return NextResponse.json({ error: "Errore nel salvataggio" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error("POST /api/account/addresses error", {
      error: err instanceof Error ? err.message : "Unknown",
    });
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
  }
}
