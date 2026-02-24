import { Metadata } from 'next';
import { SupportChatPage } from '@/lib/features/support-bot';

export const metadata: Metadata = {
  title: 'Support | Glamlink',
  description: 'Get help and support for Glamlink - your beauty marketplace platform',
};

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-8">
        <div className="max-w-3xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              How can we help?
            </h1>
            <p className="text-gray-600">
              Chat with our AI assistant or browse common questions below
            </p>
          </div>

          {/* Chat Component */}
          <SupportChatPage />

          {/* Additional Help Section */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-glamlink-purple/10 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-glamlink-purple"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900">Email Support</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                For complex issues or account-related questions
              </p>
              <a
                href="mailto:support@glamlink.net"
                className="text-glamlink-purple hover:underline text-sm font-medium"
              >
                support@glamlink.net
              </a>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-glamlink-teal/10 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-glamlink-teal"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900">Help Center</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Browse guides and tutorials
              </p>
              <span className="text-gray-400 text-sm">Coming Soon</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
