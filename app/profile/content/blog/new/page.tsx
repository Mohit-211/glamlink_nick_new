/**
 * New Blog Post Page
 *
 * Create a new blog post
 */

import { redirect } from 'next/navigation';
import { getAuthenticatedAppForUser } from '@/lib/firebase/serverApp';
import { BlogPostEditor } from '@/lib/pages/profile/components/content';

export const dynamic = 'force-dynamic';
export default async function NewBlogPostPage() {
  const { currentUser } = await getAuthenticatedAppForUser();
  if (!currentUser) {
    redirect('/login?redirect=/profile/content/blog/new');
  }

  return <BlogPostEditor isNew />;
}
