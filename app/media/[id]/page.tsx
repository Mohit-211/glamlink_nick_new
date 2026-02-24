"use client";

import { useParams } from "next/navigation";
import { notFound } from "next/navigation";

// Video URL mapping - add new videos here
const videoUrls: Record<string, { url: string; title: string }> = {
  "vault-issue-110": {
    url: "https://firebasestorage.googleapis.com/v0/b/glamlink-test.firebasestorage.app/o/magazine%2Ftemp%2Fcontent%2FBeauty%20Vault-Adison%201-26.mov?alt=media&token=d8858bc6-fbbc-4717-b636-3e6239bc31dc",
    title: "Beauty Vault - Issue 110",
  },
};

export default function MediaPage() {
  const params = useParams();
  const id = params.id as string;

  const video = videoUrls[id];

  if (!video) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          {video.title}
        </h1>
        <div className="bg-black rounded-lg overflow-hidden shadow-xl">
          <video
            src={video.url}
            controls
            autoPlay
            playsInline
            className="w-full h-auto"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  );
}
