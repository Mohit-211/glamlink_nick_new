"use client";

import { useParams } from "next/navigation";
import { notFound } from "next/navigation";

// Clip URL mapping organized by parent media ID
const clipUrls: Record<string, Record<string, { url: string; title: string }>> = {
  "vault-issue-110": {
    "clip-1": {
      url: "https://firebasestorage.googleapis.com/v0/b/glamlink-test.firebasestorage.app/o/admin%2Fvideos%2Fadmin%2Fvideo_1768892087078.mp4?alt=media&token=36ac3910-3207-41cc-a9aa-6781a9698489",
      title: "Beauty Vault - Issue 110 - Corporate To Creative",
    },
    "clip-2": {
      url: "https://firebasestorage.googleapis.com/v0/b/glamlink-test.firebasestorage.app/o/admin%2Fvideos%2Fadmin%2Fvideo_1768892043924.mp4?alt=media&token=727fb6ca-dff5-4c29-b87c-500e4298fdbc",
      title: "Beauty Vault - Issue 110 - The Raideretes",
    },
    "clip-3": {
      url: "https://firebasestorage.googleapis.com/v0/b/glamlink-test.firebasestorage.app/o/admin%2Fvideos%2Fadmin%2Fvideo_1768892212527.mp4?alt=media&token=0a11244c-3238-4279-b35c-b742038e5628",
      title: "Beauty Vault - Issue 110 - Moisturizing your Skin",
    },
  },
};

export default function ClipPage() {
  const params = useParams();
  const id = params.id as string;
  const clip = params.clip as string;

  const mediaClips = clipUrls[id];
  if (!mediaClips) {
    notFound();
  }

  const video = mediaClips[clip];
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
