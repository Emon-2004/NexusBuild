-- ====================================================================
-- NexusBuild Reviews Table & Row-Level Security (RLS)
-- File: database/create_reviews_table.sql
-- ====================================================================

-- 1. Create Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    user_name TEXT NOT NULL,
    user_email TEXT,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Performance Indexes (Following Supabase Best Practices)
CREATE INDEX IF NOT EXISTS idx_reviews_project_id ON public.reviews(project_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);

-- 3. Enable Row-Level Security (RLS)
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policy: Public Read (Everyone can view reviews)
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
CREATE POLICY "Reviews are viewable by everyone"
ON public.reviews
FOR SELECT
USING (true);

-- 5. RLS Policy: Authenticated Insert (Logged-in users can only insert their own reviews)
-- Wrapped in (SELECT auth.uid()) for optimal query planning and caching
DROP POLICY IF EXISTS "Authenticated users can insert their own reviews" ON public.reviews;
CREATE POLICY "Authenticated users can insert their own reviews"
ON public.reviews
FOR INSERT
TO authenticated
WITH CHECK (
    user_id = (SELECT auth.uid())
);

-- 6. RLS Policy: Authenticated Update (Users can only edit their own reviews)
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
CREATE POLICY "Users can update their own reviews"
ON public.reviews
FOR UPDATE
TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

-- 7. RLS Policy: Authenticated Delete (Users can only delete their own reviews)
DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.reviews;
CREATE POLICY "Users can delete their own reviews"
ON public.reviews
FOR DELETE
TO authenticated
USING (user_id = (SELECT auth.uid()));

-- 8. Table Permissions
GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
