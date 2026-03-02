import { createClient } from "@/lib/supabase/server";
import type { BlogPost } from "@/types/database";

interface GetPostsOptions {
  page?: number;
  perPage?: number;
  isPublished?: boolean;
}

interface PaginatedPosts {
  data: BlogPost[];
  count: number;
}

/**
 * Get blog posts with optional filtering.
 * @param options - Filtering options
 * @returns Paginated posts
 */
export async function getPosts(
  options: GetPostsOptions = {}
): Promise<PaginatedPosts> {
  const { page = 1, perPage = 20, isPublished } = options;
  const supabase = await createClient();
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from("blog_posts")
    .select("*", { count: "exact" });

  if (isPublished !== undefined) {
    query = query.eq("is_published", isPublished);
  }

  query = query.order("created_at", { ascending: false }).range(from, to);

  const { data, count, error } = await query;
  if (error) throw error;

  return {
    data: (data ?? []) as BlogPost[],
    count: count ?? 0,
  };
}

/**
 * Get a blog post by slug.
 * @param slug - The post slug
 * @returns Post or null
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data as BlogPost;
}

/**
 * Get published posts with pagination, optional tag and search filters.
 */
export async function getPublishedPosts(
  options: { page?: number; perPage?: number; tag?: string; search?: string } = {}
): Promise<PaginatedPosts> {
  const { page = 1, perPage = 20, tag, search } = options;
  const supabase = await createClient();
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from("blog_posts")
    .select("*", { count: "exact" })
    .eq("is_published", true);

  if (tag) {
    query = query.contains("tags", [tag]);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`);
  }

  query = query.order("published_at", { ascending: false }).range(from, to);

  const { data, count, error } = await query;
  if (error) throw error;

  return {
    data: (data ?? []) as BlogPost[],
    count: count ?? 0,
  };
}

/**
 * Get posts by tag.
 * @param tag - Tag to filter by
 * @returns Array of posts with that tag
 */
export async function getPostsByTag(tag: string): Promise<BlogPost[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("is_published", true)
    .contains("tags", [tag])
    .order("published_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as BlogPost[];
}

/**
 * Atomically increment view count for a blog post via RPC.
 */
export async function incrementViews(postId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.rpc("increment_blog_views", {
    p_post_id: postId,
  });

  if (error) throw error;
}

/**
 * Get related posts based on shared tags.
 */
export async function getRelatedPosts(
  postId: string,
  tags: string[],
  limit = 3
): Promise<BlogPost[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("is_published", true)
    .neq("id", postId)
    .overlaps("tags", tags)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as BlogPost[];
}

/**
 * Get popular posts ordered by views_count descending.
 */
export async function getPopularPosts(limit = 5): Promise<BlogPost[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("is_published", true)
    .order("views_count", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as BlogPost[];
}
