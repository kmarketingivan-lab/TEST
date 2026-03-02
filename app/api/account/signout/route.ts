import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/utils/logger";

export async function POST() {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      logger.error("Storefront sign out failed", { error: error.message });
      return NextResponse.json({ error: "Errore nel logout" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error("POST /api/account/signout error", {
      error: err instanceof Error ? err.message : "Unknown",
    });
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
  }
}
