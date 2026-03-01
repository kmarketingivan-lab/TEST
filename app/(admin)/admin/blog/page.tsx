import { requireAdmin } from "@/lib/auth/helpers";
import { getPosts } from "@/lib/dal/blog";
import { BlogTable } from "./blog-table";
import Link from "next/link";

export default async function AdminBlogPage() {
  await requireAdmin();
  const result = await getPosts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Blog</h1>
        <Link href="/admin/blog/new" className="inline-flex items-center rounded-md bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800">
          Nuovo post
        </Link>
      </div>
      <BlogTable posts={result.data} />
    </div>
  );
}
