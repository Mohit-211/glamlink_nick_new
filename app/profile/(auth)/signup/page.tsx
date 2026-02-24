"use client";

import { Suspense } from "react";
import { SignupForm } from "@/lib/features/auth/basic";

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    }>
      <SignupForm />
    </Suspense>
  );
}
