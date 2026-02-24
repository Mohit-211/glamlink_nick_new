"use client";

import { useState } from "react";
import Link from "next/link";

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
}

export default function FAQsPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const faqs: FAQ[] = [
    // General
    {
      id: 1,
      question: "What is Glamlink?",
      answer: "Glamlink is a comprehensive beauty marketplace platform that connects beauty brands, certified professionals, and clients. We provide tools for brand owners to create digital storefronts, manage their business, and grow using AI-powered features.",
      category: "General"
    },
    {
      id: 2,
      question: "How does Glamlink work?",
      answer: "Glamlink works in three ways: Brand owners can create and manage their beauty businesses, professionals can showcase their services and get certified, and clients can discover brands and book services. Our AI tools help with content creation, business insights, and personalized recommendations.",
      category: "General"
    },
    // For Brand Owners
    {
      id: 3,
      question: "How do I create my brand on Glamlink?",
      answer: "Simply sign up for an account and you'll automatically get your own brand. Use our Brand Setup Wizard to customize your profile, add products, services, and providers. You can also use our AI tools to generate professional content quickly.",
      category: "Brand Owners"
    },
    {
      id: 4,
      question: "What AI tools are available for brand owners?",
      answer: "We offer AI-powered content generation for products, provider profiles, training programs, and reviews. Our brainstorming tool helps generate business ideas, and our image generator creates professional product photos. All tools use your brand context for consistency.",
      category: "Brand Owners"
    },
    {
      id: 5,
      question: "How much does it cost to have a brand on Glamlink?",
      answer: "Creating a brand on Glamlink is free! We believe in empowering beauty entrepreneurs. Premium features and additional AI credits may be available in paid plans in the future.",
      category: "Brand Owners"
    },
    // For Professionals
    {
      id: 6,
      question: "How do I become a certified provider?",
      answer: "Contact the brand you want to work with directly through their profile. Brand owners can add you as a certified provider with different levels (Bronze, Silver, Gold, Platinum) based on your experience and qualifications.",
      category: "Professionals"
    },
    {
      id: 7,
      question: "Can I work with multiple brands?",
      answer: "Yes! You can be a certified provider for multiple brands on Glamlink. Each brand will have you listed separately in their provider directory with potentially different certification levels.",
      category: "Professionals"
    },
    // For Clients
    {
      id: 8,
      question: "How do I find beauty services near me?",
      answer: "Browse our brand directory to discover beauty brands and their certified providers. Each provider profile shows their location, services, and ratings. You can also use our 'Beautician Near Me' feature (coming soon) for location-based search.",
      category: "Clients"
    },
    {
      id: 9,
      question: "Is the AI beauty analysis tool free?",
      answer: "Yes! Our AI beauty analysis tool is free to use. Simply upload a photo and get personalized skincare recommendations, color analysis, and product suggestions based on your unique features.",
      category: "Clients"
    },
    // Technical
    {
      id: 10,
      question: "Is my data secure on Glamlink?",
      answer: "Absolutely. We use industry-standard encryption and security measures to protect your data. Your personal information is never shared without your consent, and we comply with all privacy regulations.",
      category: "Technical"
    },
    {
      id: 11,
      question: "What browsers does Glamlink support?",
      answer: "Glamlink works best on modern browsers including Chrome, Firefox, Safari, and Edge. We recommend keeping your browser updated for the best experience.",
      category: "Technical"
    },
    {
      id: 12,
      question: "Do you have a mobile app?",
      answer: "A mobile app is in development! For now, Glamlink is fully responsive and works great on mobile browsers. You can add it to your home screen for an app-like experience.",
      category: "Technical"
    }
  ];

  const categories = ["All", "General", "Brand Owners", "Professionals", "Clients", "Technical"];

  const filteredFAQs = selectedCategory === "All" 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  const toggleFAQ = (id: number) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-gray-50 to-white py-16">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Frequently Asked Questions
              </h1>
              <p className="text-xl text-gray-600">
                Find answers to common questions about Glamlink
              </p>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-8">
          <div className="container-custom">
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-2 rounded-full font-medium transition-colors ${
                    selectedCategory === category
                      ? "bg-glamlink-teal text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto">
              <div className="space-y-4">
                {filteredFAQs.map((faq) => (
                  <div
                    key={faq.id}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => toggleFAQ(faq.id)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {faq.question}
                        </h3>
                        <span className="text-sm text-gray-500 mt-1">
                          {faq.category}
                        </span>
                      </div>
                      <svg
                        className={`w-5 h-5 text-gray-500 transition-transform ${
                          openFAQ === faq.id ? "rotate-180" : ""
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {openFAQ === faq.id && (
                      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                        <p className="text-gray-700 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-16 bg-gray-50">
          <div className="container-custom">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Still have questions?
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                We're here to help! Reach out to our support team or explore our resources.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/profile/signup"
                  className="px-8 py-3 bg-glamlink-teal text-white font-semibold rounded-full hover:bg-glamlink-teal-dark transition-colors"
                >
                  Get Started
                </Link>
                <Link
                  href="/brand"
                  className="px-8 py-3 bg-white text-glamlink-teal font-semibold rounded-full border-2 border-glamlink-teal hover:bg-gray-50 transition-colors"
                >
                  Explore Brands
                </Link>
              </div>
            </div>
          </div>
        </section>
    </div>
  );
}