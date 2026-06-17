-- Grant Data API access on blog_posts and before_after_projects so the public site can read published content
GRANT SELECT ON public.blog_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_posts TO service_role;

GRANT SELECT ON public.before_after_projects TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.before_after_projects TO authenticated;
GRANT ALL ON public.before_after_projects TO service_role;