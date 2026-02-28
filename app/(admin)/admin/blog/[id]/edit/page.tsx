import { requireAdmin } from "@/lib/auth/helpers";
import { createClient } from "@/lib/supabase/server";
import { BlogForm } from "../../blog-form";
import { updatePost } from "../../actions";
import { notFound } from "next/navigation";
import type { BlogPost } from "@/types/database";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPostPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  const supabase = await createClient();
  const { data } = await supabase.from("blog_posts").select("*").eq("id", id).single();
  if (!data) notFound();
  const post = data as BlogPost;

  async function handleUpdate(formData: FormData) {
    "use server";
    return updatePost(id, formData);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Modifica post</h1>
      <BlogForm post={post} action={handleUpdate} />
    </div>
  );
}
