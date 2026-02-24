/**
 * Blog Posts Page
 *
 * Main blog posts listing page
 */

import { redirect } from 'next/navigation';
import { getAuthenticatedAppForUser } from '@/lib/firebase/serverApp';
import { BlogPostsList } from '@/lib/pages/profile/components/content';
export const dynamic = "force-dynamic";
export default async function BlogPostsPage() {
  const { currentUser } = await getAuthenticatedAppForUser();

  if (!currentUser) {
    redirect('/login?redirect=/profile/content/blog');
  }

  return <BlogPostsList />;
}
