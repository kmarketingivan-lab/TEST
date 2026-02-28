import { NextResponse } from "next/server";
import { getMedia } from "@/lib/dal/media";
import { requireAdmin } from "@/lib/auth/helpers";
import { logger } from "@/lib/utils/logger";

/**
 * GET /api/media — List media files (admin only).
 */
export async function GET(request: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get("folder") ?? undefined;
    const media = await getMedia(folder);
    return NextResponse.json(media);
  } catch (err) {
    logger.error("GET /api/media error", { error: err instanceof Error ? err.message : "Unknown" });
    return NextResponse.json([], { status: 200 });
  }
}
