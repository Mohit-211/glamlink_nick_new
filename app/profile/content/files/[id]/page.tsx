/**
 * File Editor Page
 *
 * Single file detail and editing page
 */

import { redirect } from 'next/navigation';
import { getAuthenticatedAppForUser } from '@/lib/firebase/serverApp';
import { FileEditor } from '@/lib/pages/profile/components/content';

interface FileEditorPageProps {
  params: Promise<{ id: string }>;
}

export default async function FileEditorPage({ params }: FileEditorPageProps) {
  const { currentUser } = await getAuthenticatedAppForUser();
  const { id } = await params;

  if (!currentUser) {
    redirect(`/login?redirect=/profile/content/files/${id}`);
  }

  return <FileEditor fileId={id} />;
}
