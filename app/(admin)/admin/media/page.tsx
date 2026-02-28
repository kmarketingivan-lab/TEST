import { requireAdmin } from "@/lib/auth/helpers";
import { getMedia } from "@/lib/dal/media";
import { MediaGrid } from "./media-grid";

export default async function AdminMediaPage() {
  await requireAdmin();
  const media = await getMedia();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Media</h1>
      <MediaGrid media={media} />
    </div>
  );
}
