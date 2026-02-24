/**
 * Files Dashboard Page
 *
 * Main files management page
 */

import { redirect } from 'next/navigation';
import { getAuthenticatedAppForUser } from '@/lib/firebase/serverApp';
import { FilesDashboard } from '@/lib/pages/profile/components/content';
export const dynamic = 'force-dynamic';
export default async function FilesPage() {
  const { currentUser } = await getAuthenticatedAppForUser();

  if (!currentUser) {
    redirect('/login?redirect=/profile/content/files');
  }

  return <FilesDashboard />;
}
