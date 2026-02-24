"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { GetFeaturedFormData, GetFeaturedFormProps, SubmittedFile } from "../types";
import { fields_layout as staticFieldsLayout, FieldsLayout } from "../config/fields";
import { useTabValidationOptimized } from "@/lib/pages/apply/shared/hooks";
import {
  CoverForm,
  LocalSpotlightForm,
  TopTreatmentForm,
  RisingStarForm,
  MagazinePreviewSection,
  ProfileInfoForm
} from "./forms";
import { DynamicMissingFieldsSummary, PerformanceMonitor } from "@/lib/pages/apply/shared/components/form-utils";

export default function FeaturedForm({ onSubmit, isLoading = false, configs }: GetFeaturedFormProps) {
  const fieldsLayout: FieldsLayout = useMemo(() => {
    if (configs?.fieldsLayout) {
      return {
        profile: { ...staticFieldsLayout.profile, ...configs.fieldsLayout.profile },
        glamlinkIntegration: { ...staticFieldsLayout.glamlinkIntegration, ...configs.fieldsLayout.glamlinkIntegration },
        cover: { ...staticFieldsLayout.cover, ...configs.fieldsLayout.cover },
        localSpotlight: { ...staticFieldsLayout.localSpotlight, ...configs.fieldsLayout.localSpotlight },
        risingStar: { ...staticFieldsLayout.risingStar, ...configs.fieldsLayout.risingStar },
        topTreatment: { ...staticFieldsLayout.topTreatment, ...configs.fieldsLayout.topTreatment }
      };
    }
    return staticFieldsLayout;
  }, [configs]);

  const [formData, setFormData] = useState<GetFeaturedFormData>(() => ({
    email: fieldsLayout.profile.email?.defaultValue || '',
    fullName: '',
    phone: '',
    businessName: '',
    businessAddress: '',
    primarySpecialties: [],
    otherSpecialty: '',
    website: '',
    instagramHandle: '',
    certifications: false,
    certificationDetails: '',
    applicationType: fieldsLayout.profile.applicationType?.defaultValue || 'local-spotlight',

    bio: '',
    headshots: [],
    workPhotos: [],
    achievements: ['', '', '', '', ''],
    favoriteQuote: '',
    professionalProduct: '',
    confidenceStory: '',
    excitementFeatures: [],
    painPoints: [],
    bookingPreference: 'in-app',
    bookingLink: '',
    ecommerceInterest: 'later',
    contentDays: '',
    giveaway: '',
    specialOffers: '',

    promotionOffer: false,
    promotionDetails: '',
    contentPlanningRadio: '',
    contentPlanningDate: '',
    contentPlanningMedia: [],
    instagramConsent: false,
    hearAboutLocalSpotlight: '',

    city: '',
    specialties: '',
    workExperience: '',
    socialMedia: '',
    availability: '',
    featuredInterest: '',
    whyLocalSpotlight: '',

    treatmentName: '',
    treatmentCategory: '',
    treatmentDescription: '',
    treatmentBenefits: ['', '', '', '', ''],
    treatmentDuration: '',
    treatmentPrice: '',
    treatmentExperience: '',
    treatmentProcess: '',
    clientResults: '',
    idealCandidates: '',
    aftercareInstructions: '',
    trainingCertification: '',
    specialEquipment: '',
    equipmentDetails: '',
    consultationOffer: '',
    whyTopTreatment: '',
    beforeAfterPhotos: [],

    location: '',
    instagram: '',
    careerStartTime: '',
    backgroundStory: '',
    careerHighlights: ['', '', '', '', ''],
    uniqueApproach: '',
    achievementsRisingStar: ['', '', '', '', ''],
    clientTestimonials: '',
    industryChallenges: '',
    innovations: '',
    futureGoals: '',
    industryInspiration: '',
    communityInvolvement: '',
    communityDetails: '',
    socialMediaPresence: '',
    awardsRecognition: '',
    mediaFeatures: '',
    mentorshipDetails: '',
    advice: '',
    contactPreference: '',
    additionalInfo: '',
    portfolioPhotos: [],
    professionalPhotos: [],
  }));

  const selectedForm = formData.applicationType || 'local-spotlight';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    validateTab,
    isFormComplete,
    errors,
    clearFieldError,
    clearAllErrors,
    getMissingFields,
    getProgressInfo,
    validateFieldOnBlur,
    clearFieldErrorOnFocus,
    forceProgressUpdate
  } = useTabValidationOptimized(formData, fieldsLayout);

  const handleSubmitWithProgressUpdate = async (e: React.FormEvent) => {
    forceProgressUpdate();
    handleSubmit(e);
  };

  // ✅ fieldKey widened to string | number to match child form component expectations
  const handleFieldChange = useCallback((fieldKey: string | number, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldKey]: value
    }));
    if (errors[fieldKey]) {
      clearFieldError(String(fieldKey));
    }
  }, [errors, clearFieldError]);

  const handleFieldBlur = useCallback((fieldKey: string | number) => {
    validateFieldOnBlur(String(fieldKey));
  }, [validateFieldOnBlur]);

  const handleFieldFocus = useCallback((fieldKey: string | number) => {
    clearFieldErrorOnFocus(String(fieldKey));
  }, [clearFieldErrorOnFocus]);

  const progressInfo = getProgressInfo(selectedForm as any);
  const progressPercentage = progressInfo.progressPercentage;

  const getProgressMessage = useCallback(() => {
    if (progressPercentage === 0) return "Start with your profile information";
    if (progressPercentage === 100) return "All required fields completed! Ready to submit.";
    return `${progressInfo.completedFields} of ${progressInfo.totalFields} required fields completed`;
  }, [progressPercentage, progressInfo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isLoading) return;
    if (!progressInfo.isComplete) {
      setSubmitError(`Please complete all required fields. ${progressInfo.missingFields} fields are still missing.`);
      return;
    }
    setIsSubmitting(true);
    setSubmitError(null);
    clearAllErrors();
    try {
      const submissionData = {
        ...formData,
        formType: formData.applicationType
      };
      await onSubmit(submissionData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setSubmitError(errorMessage);
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmitWithProgressUpdate} className="space-y-8">
        {/* Profile Information Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Profile Information</h3>
            <p className="text-gray-600">
              Please provide your basic contact and business information. All fields except Website are required.
            </p>
          </div>
          <ProfileInfoForm
            formData={formData}
            handleFieldChange={handleFieldChange}
            handleFieldBlur={handleFieldBlur}
            handleFieldFocus={handleFieldFocus}
            errors={errors}
            disabled={isLoading || isSubmitting}
            profileConfig={fieldsLayout.profile}
          />
        </div>

        {/* Dynamic Form Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {selectedForm === 'cover' && (
            <CoverForm
              formData={formData}
              handleFieldChange={handleFieldChange}
              handleFieldBlur={handleFieldBlur}
              handleFieldFocus={handleFieldFocus}
              errors={errors}
              isLoading={isLoading}
              isSubmitting={isSubmitting}
              fieldsConfig={fieldsLayout.cover}
              glamlinkConfig={fieldsLayout.glamlinkIntegration}
            />
          )}
          {selectedForm === 'local-spotlight' && (
            <LocalSpotlightForm
              formData={formData}
              handleFieldChange={handleFieldChange}
              handleFieldBlur={handleFieldBlur}
              handleFieldFocus={handleFieldFocus}
              errors={errors}
              isLoading={isLoading}
              isSubmitting={isSubmitting}
              fieldsConfig={fieldsLayout.localSpotlight}
              glamlinkConfig={fieldsLayout.glamlinkIntegration}
            />
          )}
          {selectedForm === 'top-treatment' && (
            <TopTreatmentForm
              formData={formData}
              handleFieldChange={handleFieldChange}
              handleFieldBlur={handleFieldBlur}
              handleFieldFocus={handleFieldFocus}
              errors={errors}
              isLoading={isLoading}
              isSubmitting={isSubmitting}
              fieldsConfig={fieldsLayout.topTreatment}
              glamlinkConfig={fieldsLayout.glamlinkIntegration}
            />
          )}
          {selectedForm === 'rising-star' && (
            <RisingStarForm
              formData={formData}
              handleFieldChange={handleFieldChange}
              handleFieldBlur={handleFieldBlur}
              handleFieldFocus={handleFieldFocus}
              errors={errors}
              isLoading={isLoading}
              isSubmitting={isSubmitting}
              fieldsConfig={fieldsLayout.risingStar}
              glamlinkConfig={fieldsLayout.glamlinkIntegration}
            />
          )}
        </div>

        {/* Error Display */}
        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{submitError}</h3>
              </div>
            </div>
          </div>
        )}

        {/* Progress Indicator */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-500">{getProgressMessage()}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-glamlink-teal h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Complete all required fields in your profile and selected application type before submitting
          </div>
        </div>

        {/* Dynamic Missing Fields Summary */}
        <DynamicMissingFieldsSummary
          selectedForm={selectedForm}
          getMissingFields={getMissingFields}
        />

        {/* Submit Button */}
        <div className="flex justify-center pt-6">
          <button
            type="submit"
            disabled={!progressInfo.isComplete || isLoading || isSubmitting}
            className={`
              px-8 py-3 font-semibold rounded-full transition-all duration-200
              ${!progressInfo.isComplete || isLoading || isSubmitting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-glamlink-teal text-white hover:bg-glamlink-teal-dark shadow-lg hover:shadow-xl transform hover:scale-105'
              }
            `}
          >
            {isSubmitting ? 'Submitting...' : isLoading ? 'Loading...' : 'Submit'}
          </button>
        </div>
      </form>
    </>
  );
}