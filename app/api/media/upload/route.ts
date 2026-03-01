import { NextResponse } from "next/server";
import { fileTypeFromBuffer } from "file-type";
import { uploadMedia } from "@/app/(admin)/admin/media/actions";
import { getMediaById } from "@/lib/dal/media";
import { logger } from "@/lib/utils/logger";

const ALLOWED_IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

/**
 * POST /api/media/upload — Upload a media file (admin only).
 * Validates magic bytes before delegating to uploadMedia.
 * Returns the uploaded media URL for inline use.
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    // Validate magic bytes if file is present
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const detected = await fileTypeFromBuffer(buffer);

      if (!detected || !ALLOWED_IMAGE_MIMES.has(detected.mime)) {
        return NextResponse.json(
          { error: "Tipo file non consentito" },
          { status: 400 }
        );
      }
    }

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
