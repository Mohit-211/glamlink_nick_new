import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container-custom py-20">
          <div className="max-w-2xl mx-auto text-center">
            {/* Development Icon */}
            <div className="mb-8">
              <svg
                className="mx-auto h-32 w-32 text-glamlink-teal opacity-70"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>

            {/* Development Message */}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Page still in development
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              We're currently working on this page to bring you an amazing experience. 
              Check back soon for updates!
            </p>

            {/* Action Button */}
            <div className="mb-12">
              <Link
                href="/"
                className="inline-block px-8 py-3 bg-glamlink-teal text-white font-semibold rounded-full hover:bg-glamlink-teal-dark transition-colors duration-200"
              >
                Go to Homepage
              </Link>
            </div>

            {/* Development Progress Notice */}
            <div className="mt-12 p-6 bg-amber-50 rounded-lg">
              <p className="text-sm text-amber-800">
                <span className="font-semibold">🚧 Under Construction:</span> Our team is actively developing this feature. 
                We're committed to delivering a polished experience that meets our high standards.
              </p>
            </div>
          </div>
        </div>
    </div>
  );
}