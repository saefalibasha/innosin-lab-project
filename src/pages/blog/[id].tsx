import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient' // Adjust path as needed

export default function BlogPostByIdPage() {
  const router = useRouter();
  const { id } = router.query;
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single();

      setPost(data);
      setLoading(false);
    };
    fetchPost();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!post) return <div>Article not found.</div>;

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
      <p className="text-gray-600 mb-2">{post.publish_date} • {post.read_time} min read</p>
      {post.featured_image && (
        <div className="mb-6">
          <img src={post.featured_image} alt={post.title} className="w-full rounded" />
        </div>
      )}
      <div className="prose" dangerouslySetInnerHTML={{ __html: post.content }} />
      <div className="mt-8 text-gray-500">By {post.author}</div>
    </div>
  );
}
