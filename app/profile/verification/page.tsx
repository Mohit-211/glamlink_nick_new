"use client";

/**
 * Verification Page - User-facing verification form and status
 */

import { useState } from "react";
import { Shield, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/features/auth/useAuth";
import {
  VerificationForm,
  VerificationStatusCard,
  useVerificationStatus,
} from "@/lib/features/profile-settings";

export default function VerificationPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { status, submission, isLoading: statusLoading } = useVerificationStatus();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSuccess = () => {
    setShowSuccess(true);
    // Refresh status after a delay
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  if (authLoading || statusLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-glamlink-teal" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to access verification</p>
          <Link
            href="/login?redirect=/profile/verification"
            className="text-glamlink-teal hover:underline"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // Show success message after submission
  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-lg mx-auto text-center">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Verification Submitted!
            </h2>
            <p className="text-gray-600 mb-6">
              Your verification request has been submitted successfully. Our team
              will review your application within 2-3 business days.
            </p>
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-glamlink-teal text-white font-medium rounded-lg hover:bg-glamlink-teal/90 transition-colors"
            >
              Back to Profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If already verified or has pending/rejected submission, show status
  if (status !== "none") {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Back Link */}
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Profile
          </Link>

          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-glamlink-teal/10 rounded-lg">
              <Shield className="w-6 h-6 text-glamlink-teal" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Business Verification
              </h1>
              <p className="text-gray-600">
                Verify your business to build trust with customers
              </p>
            </div>
          </div>

          {/* Status Card */}
          <VerificationStatusCard showStartButton={status === "rejected"} />
        </div>
      </div>
    );
  }

  // Show verification form for new submissions
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back Link */}
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-glamlink-teal/10 rounded-lg">
            <Shield className="w-6 h-6 text-glamlink-teal" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Get Verified
            </h1>
            <p className="text-gray-600">
              Verify your business to build trust with customers
            </p>
          </div>
        </div>

        {/* Benefits Banner */}
        <div className="bg-gradient-to-r from-glamlink-teal/10 to-glamlink-teal/5 rounded-xl p-6 mb-8">
          <h3 className="text-sm font-semibold text-glamlink-teal mb-3">
            Why get verified?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-glamlink-teal mt-0.5" />
              <span className="text-sm text-gray-700">
                Verified badge on profile
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-glamlink-teal mt-0.5" />
              <span className="text-sm text-gray-700">
                Build customer trust
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-glamlink-teal mt-0.5" />
              <span className="text-sm text-gray-700">
                Priority in search
              </span>
            </div>
          </div>
        </div>

        {/* Verification Form */}
        <VerificationForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
