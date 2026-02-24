/**
 * Blog Post Editor Page
 *
 * Edit existing blog post
 */

import { redirect } from 'next/navigation';
import { getAuthenticatedAppForUser } from '@/lib/firebase/serverApp';
import { BlogPostEditor } from '@/lib/pages/profile/components/content';

interface BlogPostEditorPageProps {
  params: Promise<{ id: string }>;
}

export default async function BlogPostEditorPage({ params }: BlogPostEditorPageProps) {
  const { currentUser } = await getAuthenticatedAppForUser();
  const { id } = await params;

  if (!currentUser) {
    redirect(`/login?redirect=/profile/content/blog/${id}`);
  }

  return <BlogPostEditor postId={id} />;
}
