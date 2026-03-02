-- ============================================
-- Migration 0024: blog_posts views_count + RPC
-- ============================================

ALTER TABLE blog_posts ADD COLUMN views_count INTEGER NOT NULL DEFAULT 0;

-- RPC: atomically increment blog post views
CREATE OR REPLACE FUNCTION increment_blog_views(p_post_id UUID)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE blog_posts
    SET views_count = views_count + 1
    WHERE id = p_post_id;
$$;
