import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/utils/logger";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const body = await request.json();
    const { label, full_name, phone, street, city, province, postal_code, country } = body as Record<string, string>;

    if (!label || !full_name || !street || !city || !province || !postal_code || !country) {
      return NextResponse.json({ error: "Compila tutti i campi obbligatori" }, { status: 400 });
    }

    const { error } = await supabase
      .from("addresses")
      .update({ label, full_name, phone: phone || null, street, city, province, postal_code, country })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      logger.error("Address update failed", { error: error.message });
      return NextResponse.json({ error: "Errore nel salvataggio" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error("PUT /api/account/addresses error", {
      error: err instanceof Error ? err.message : "Unknown",
    });
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
    }

    const { error } = await supabase
      .from("addresses")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      logger.error("Address delete failed", { error: error.message });
      return NextResponse.json({ error: "Errore nell'eliminazione" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error("DELETE /api/account/addresses error", {
      error: err instanceof Error ? err.message : "Unknown",
    });
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
  }
}
