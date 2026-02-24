/**
 * Content Management Page
 *
 * Overview page for content management (files and blog)
 */

import { redirect } from 'next/navigation';
import { getAuthenticatedAppForUser } from '@/lib/firebase/serverApp';
import Link from 'next/link';
export const dynamic = "force-dynamic";
export default async function ContentPage() {
  const { currentUser } = await getAuthenticatedAppForUser();

  if (!currentUser) {
    redirect('/login?redirect=/profile/content');
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Content</h1>
      <p className="text-gray-500">
        Manage your files and blog posts from one central location.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Files Card */}
        <Link
          href="/profile/content/files"
          className="bg-white rounded-xl border border-gray-200 p-6 hover:border-pink-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-pink-50 rounded-lg group-hover:bg-pink-100 transition-colors">
              <svg
                className="w-6 h-6 text-pink-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-medium text-gray-900 group-hover:text-pink-600 transition-colors">
                Files
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Upload and manage images, videos, and documents
              </p>
              <div className="flex items-center mt-4 text-sm text-pink-600">
                <span>Manage files</span>
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </Link>

        {/* Blog Posts Card */}
        <Link
          href="/profile/content/blog"
          className="bg-white rounded-xl border border-gray-200 p-6 hover:border-pink-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-pink-50 rounded-lg group-hover:bg-pink-100 transition-colors">
              <svg
                className="w-6 h-6 text-pink-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-medium text-gray-900 group-hover:text-pink-600 transition-colors">
                Blog posts
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Create and publish blog content for your audience
              </p>
              <div className="flex items-center mt-4 text-sm text-pink-600">
                <span>Manage blog</span>
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
