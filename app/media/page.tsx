"use client";

import Link from "next/link";

// Available media items
const mediaItems = [
  {
    id: "vault-issue-110",
    title: "Beauty Vault - Issue 110",
    description: "Featured content from Beauty Vault Issue 110",
  },
];

export default function MediaIndexPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Media Gallery
        </h1>
        <div className="grid gap-6">
          {mediaItems.map((item) => (
            <Link
              key={item.id}
              href={`/media/${item.id}`}
              className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {item.title}
              </h2>
              <p className="text-gray-600">{item.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
