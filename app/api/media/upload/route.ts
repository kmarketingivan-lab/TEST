import { NextResponse } from "next/server";
import { uploadMedia } from "@/app/(admin)/admin/media/actions";
import { getMediaById } from "@/lib/dal/media";
import { logger } from "@/lib/utils/logger";

/**
 * POST /api/media/upload — Upload a media file (admin only).
 * Returns the uploaded media URL for inline use.
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const result = await uploadMedia(formData);

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    if (result.id) {
      const media = await getMediaById(result.id);
      if (media) {
        return NextResponse.json({ url: media.url, id: media.id });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error("POST /api/media/upload error", { error: err instanceof Error ? err.message : "Unknown" });
    return NextResponse.json({ error: "Errore nel caricamento" }, { status: 500 });
  }
}
