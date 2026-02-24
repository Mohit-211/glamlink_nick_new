"use client";

import { useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";

// Type definitions for this sample file
interface RisingStarContent {
  starName: string;
  starTitle?: string;
  starTitle2?: string;
  starTitle2Typography?: any;
  starImage?: any;
  bio?: string;
  quote?: string;
  quoteAuthor?: string;
  quoteOverImage?: boolean;
  content?: string;
  contentTitle?: string;
  contentTitleTypography?: any;
  accolades?: any[];
  accoladesTitle?: string;
  photoGallery?: {
    title?: string;
    images?: any[];
  };
  socialLinks?: {
    instagram?: any;
    website?: any;
    glamlinkProfile?: any;
  };
  subtitle2?: string;
  headerLayout?: string;
}

// Stub implementations for missing imports
interface PDFImageLinkProps {
  href: string;
  action?: string;
  pdfImageSrc: string;
  pdfImageAlt: string;
  className: string;
  target?: string;
  onClick?: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}

const PDFImageLink: React.FC<PDFImageLinkProps> = ({ href, children, className, target, onClick }) => (
  <a href={href} className={className} target={target} onClick={onClick}>
    {children}
  </a>
);

const mergeUniversalStyleSettings = (content: any, preset: any) => ({
  titleFontSize: "",
  titleFontFamily: "",
  titleFontWeight: "",
  titleAlignment: "",
  titleColor: "",
  subtitleFontSize: "",
  subtitleFontFamily: "",
  subtitleFontWeight: "",
  subtitleAlignment: "",
  subtitleColor: "",
  subtitle2FontSize: "",
  subtitle2FontFamily: "",
  subtitle2FontWeight: "",
  subtitle2Alignment: "",
  subtitle2Color: "",
});

const getUniversalLayoutPreset = (layout?: string) => ({});
const getAlignmentClass = (alignment?: string) => alignment === "center" ? "text-center" : alignment === "right" ? "text-right" : "";
const getImageUrl = (image: any) => typeof image === "string" ? image : image?.url || "";
const getImageObjectPosition = (image: any) => typeof image === "object" ? `${image?.objectPositionX || 50}% ${image?.objectPositionY || 50}%` : "50% 50%";

// Dynamically import the dialogs to avoid SSR issues
const ProDownloadDialog = dynamic(() => import("@/lib/components/modals/ProDownloadDialog"), { ssr: false });
const UserDownloadDialog = dynamic(() => import("@/lib/components/modals/UserDownloadDialog"), { ssr: false });

interface RisingStarProps {
  content: RisingStarContent;
  title?: string;
  subtitle?: string;
  backgroundColor?: string | { main?: string; bio?: string; quote?: string; gallery?: string; accolades?: string; socialMedia?: string };
}

export default function RisingStar({ content, title, subtitle, backgroundColor }: RisingStarProps) {
  const [showProDialog, setShowProDialog] = useState(false);
  const [showUserDialog, setShowUserDialog] = useState(false);
  // Check if we're in PDF export mode
  const isPdfExport = typeof window !== "undefined" && (document.querySelector("#temp-section-export") || document.querySelector("#magazine-pdf-render-container"));

  // Get merged style settings
  const styles = mergeUniversalStyleSettings(content, getUniversalLayoutPreset(content.headerLayout));

  // Parse background colors
  const backgrounds = typeof backgroundColor === "object" ? backgroundColor : { main: backgroundColor };

  // Check if a value is a Tailwind class
  const isTailwindClass = (value?: string) => {
    return value && (value.startsWith("bg-") || value.includes(" bg-") || value.includes("from-") || value.includes("to-"));
  };

  // Apply background style or class
  const getBackgroundProps = (bgValue?: string) => {
    if (!bgValue || bgValue === "transparent") return {};
    if (isTailwindClass(bgValue)) {
      return { className: bgValue };
    }
    return { style: { background: bgValue } };
  };

  const mainBgProps = getBackgroundProps(backgrounds?.main);
  const bioBgProps = getBackgroundProps(backgrounds?.bio);
  const quoteBgProps = getBackgroundProps(backgrounds?.quote);
  const galleryBgProps = getBackgroundProps(backgrounds?.gallery);
  const accoladesBgProps = getBackgroundProps(backgrounds?.accolades);
  const socialMediaBgProps = getBackgroundProps(backgrounds?.socialMedia);

  return (
    <>
      <div className={`${isPdfExport ? "pdf-export-mode" : ""} ${mainBgProps.className || ""}`} style={mainBgProps.style}>
        {/* Header with dynamic styling */}
        {(title || subtitle) && (
          <div className="mb-4 sm:mb-6 md:mb-8 px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 md:pt-8">
            {title && (
              <h2
                className={`
              ${styles.titleFontSize || "text-3xl md:text-4xl"} 
              ${styles.titleFontFamily || "font-serif"}
              ${styles.titleFontWeight || "font-bold"}
              ${getAlignmentClass(styles.titleAlignment)}
              ${styles.titleColor || "text-gray-900"}
              mb-2
            `}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p
                className={`
              ${styles.subtitleFontSize || "text-lg md:text-xl"} 
              ${styles.subtitleFontFamily || "font-sans"}
              ${styles.subtitleFontWeight || "font-medium"}
              ${getAlignmentClass(styles.subtitleAlignment)}
              ${styles.subtitleColor || "text-gray-600"}
            `}
              >
                {subtitle}
              </p>
            )}
            {content.subtitle2 && (
              <p
                className={`
              ${styles.subtitle2FontSize || "text-base"} 
              ${styles.subtitle2FontFamily || "font-sans"}
              ${styles.subtitle2FontWeight || "font-normal"}
              ${getAlignmentClass(styles.subtitle2Alignment)}
              ${styles.subtitle2Color || "text-gray-500"}
              mt-1
            `}
              >
                {content.subtitle2}
              </p>
            )}
          </div>
        )}

        {/* Hero Section - Asymmetric Split Layout or Full Width with Quote Overlay */}
        <div className="relative overflow-hidden">
          {/* Star decorations */}
          <div className="absolute top-0 left-0 text-gray-200 opacity-30 text-6xl">★</div>
          <div className="absolute top-20 right-10 text-gray-200 opacity-30 text-4xl">✦</div>
          <div className="absolute bottom-10 left-20 text-gray-200 opacity-30 text-5xl">★</div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6">
            {content.quoteOverImage && content.quote && content.starImage ? (
              // Full-width image with quote card overlay layout
              (() => {
                if (isPdfExport) {
                  console.log("Rendering quote overlay in PDF mode with white background");
                }
                return (
                  <>
                    <div className="relative">
                      <div className="relative rounded-lg overflow-hidden shadow-xl">
                        <Image
                          src={getImageUrl(content.starImage)}
                          alt={content.starName}
                          width={1200}
                          height={800}
                          className="w-full h-auto"
                          style={{
                            objectPosition: getImageObjectPosition(content.starImage),
                          }}
                        />

                        {/* Quote Card Overlay - positioned at bottom */}
                        <div className="absolute inset-x-0 bottom-0 flex justify-center p-8">
                          <div
                            className={`rounded-xl p-6 relative max-w-md shadow-2xl ${isPdfExport ? "pdf-quote-card bg-white" : `backdrop-blur-sm ${quoteBgProps.className || "bg-gray-100/95"}`}`}
                            style={isPdfExport ? { backgroundColor: "white", background: "white", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" } : quoteBgProps.style}
                          >
                            <div className="absolute top-2 left-2 text-4xl text-gray-400 opacity-50">"</div>
                            <blockquote className="text-lg italic text-gray-800 font-serif pl-2 sm:pl-6 md:pl-8 pr-2 sm:pr-4">{content.quote}</blockquote>
                            {content.quoteAuthor && <p className="text-right mt-3 text-gray-600">— {content.quoteAuthor}</p>}
                            <div className="absolute bottom-2 right-2 text-4xl text-gray-400 opacity-50">"</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bio Card below the image if it exists */}
                    {content.bio && (
                      <div className="mt-8 max-w-3xl mx-auto">
                        <div className={`rounded-xl shadow-lg p-6 relative overflow-hidden ${bioBgProps.className || "bg-white"}`} style={bioBgProps.style}>
                          <div className="absolute top-0 right-0 text-gray-100 text-8xl opacity-50">★</div>
                          <h3 className="text-2xl font-semibold mb-3 text-gray-900 relative z-10">About</h3>
                          <p className="text-gray-700 leading-relaxed relative z-10">{content.bio}</p>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()
            ) : (
              // Original two-column layout
              <div className={`grid gap-8 items-center ${content.bio || content.quote ? "lg:grid-cols-2" : "lg:grid-cols-1"}`}>
                {/* Left side - Image only */}
                <div className="relative">
                  {content.starImage && (
                    <div className="relative">
                      <div className={`relative rounded-lg overflow-hidden shadow-xl ${!content.bio && !content.quote ? "max-w-2xl mx-auto" : ""}`}>
                        <Image
                          src={getImageUrl(content.starImage)}
                          alt={content.starName}
                          width={1200}
                          height={800}
                          className="w-full h-auto"
                          style={{
                            objectPosition: getImageObjectPosition(content.starImage),
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Right side - Bio and Quote (only show if at least one has content) */}
                {(content.bio || content.quote) && (
                  <div className="space-y-6">
                    {/* Bio Card - only show if bio exists */}
                    {content.bio && (
                      <div className={`rounded-xl shadow-lg p-6 relative overflow-hidden ${bioBgProps.className || "bg-white"}`} style={bioBgProps.style}>
                        <div className="absolute top-0 right-0 text-gray-100 text-8xl opacity-50">★</div>
                        <h3 className="text-2xl font-semibold mb-3 text-gray-900 relative z-10">About</h3>
                        <p className="text-gray-700 leading-relaxed relative z-10">{content.bio}</p>
                      </div>
                    )}

                    {/* Quote Box - only show if quote exists and not overlaid on image */}
                    {content.quote &&
                      !content.quoteOverImage &&
                      (() => {
                        if (isPdfExport) {
                          console.log("Rendering quote box (non-overlay) in PDF mode with white background");
                        }
                        return (
                          <div
                            className={`rounded-xl p-6 relative ${isPdfExport ? "pdf-quote-card bg-white" : `${quoteBgProps.className || "bg-gray-100"}`}`}
                            style={isPdfExport ? { backgroundColor: "white", background: "white", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" } : quoteBgProps.style}
                          >
                            <div className="absolute top-2 left-2 text-4xl text-gray-400 opacity-50">"</div>
                            <blockquote className="text-lg italic text-gray-800 font-serif pl-2 sm:pl-6 md:pl-8 pr-2 sm:pr-4">{content.quote}</blockquote>
                            {content.quoteAuthor && <p className="text-right mt-3 text-gray-600">— {content.quoteAuthor}</p>}
                            <div className="absolute bottom-2 right-2 text-4xl text-gray-400 opacity-50">"</div>
                          </div>
                        );
                      })()}
                  </div>
                )}
              </div>
            )}

            {/* Name and Title - Full Width Below Grid */}
            <div className="mt-8 text-center">
              <h1 className="text-4xl lg:text-5xl font-bold text-glamlink-teal">{content.starName}</h1>
              {content.starTitle && <p className="text-xl text-gray-600 mt-4">{content.starTitle}</p>}
              {content.starTitle2 && (
                <p
                  className={`
                ${content.starTitle2Typography?.fontSize || "text-lg"} 
                ${content.starTitle2Typography?.fontFamily || "font-sans"}
                ${content.starTitle2Typography?.fontWeight || "font-normal"}
                ${content.starTitle2Typography?.color || "text-gray-500"}
                mt-2
              `}
                >
                  {content.starTitle2}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        {content.content && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
            {content.contentTitle && (
              <h2
                className={`
              ${content.contentTitleTypography?.fontSize || "text-3xl"} 
              ${content.contentTitleTypography?.fontFamily || "font-sans"}
              ${content.contentTitleTypography?.fontWeight || "font-bold"}
              ${content.contentTitleTypography?.fontStyle || ""}
              ${content.contentTitleTypography?.color || "text-gray-900"}
              ${content.contentTitleTypography?.alignment === "center" ? "text-center" : content.contentTitleTypography?.alignment === "right" ? "text-right" : "text-left"}
              mb-6
            `}
              >
                {content.contentTitle}
              </h2>
            )}
            <div className="rich-content max-w-none text-gray-900" dangerouslySetInnerHTML={{ __html: content.content }} />
          </div>
        )}

        {/* Accolades Section */}
        {content.accolades &&
          content.accolades.length > 0 &&
          (() => {
            // Log section rendering mode
            if (isPdfExport) {
              console.log("=== Rendering Accolades Section in PDF Mode ===");
              console.log("Total accolades:", content.accolades.length);
              console.log("Section background props:", accoladesBgProps);
            }

            return (
              <div className={`py-12 ${isPdfExport ? "pdf-accolades-section" : ""} ${accoladesBgProps.className || "bg-gradient-to-b from-gray-50 to-white"}`} style={accoladesBgProps.style}>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
                  <h3 className="text-3xl lg:text-4xl font-bold text-center mb-12 text-gray-900">{content.accoladesTitle || "Achievements & Recognition"}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {content.accolades.map((accolade: any, index: number) => {
                      // Log rendering state for debugging PDF issues
                      if (isPdfExport) {
                        console.log(`Rendering accolade ${index + 1} in PDF mode:`, {
                          title: typeof accolade === "string" ? accolade : accolade.title,
                          isPdfExport,
                          willUseSimplifiedRendering: true,
                        });
                      }
                      // Icon mapping for predefined icon names
                      const iconMap: { [key: string]: string } = {
                        trophy: "🏆",
                        star: "⭐",
                        medal: "🥇",
                        award: "🎖️",
                        sparkle: "✨",
                        crown: "👑",
                        shine: "🌟",
                        badge: "🏅",
                        heart: "❤️",
                        fire: "🔥",
                        rocket: "🚀",
                        gem: "💎",
                        check: "✅",
                        celebration: "🎉",
                        thumbsup: "👍",
                        clap: "👏",
                        target: "🎯",
                        lightbulb: "💡",
                        key: "🔑",
                        gift: "🎁",
                      };

                      // Determine which icon to use
                      let displayIcon = "🏆"; // Default icon

                      if (typeof accolade === "object" && accolade.icon) {
                        // Check if it's a predefined icon name or direct emoji
                        displayIcon = iconMap[accolade.icon.toLowerCase()] || accolade.icon;
                      }

                      // Simplified rendering for PDF export to ensure white backgrounds are captured
                      if (isPdfExport) {
                        console.log(`  Using simplified PDF rendering for accolade ${index + 1}`);

                        // Log what we're about to render
                        console.log(`  Will render with classes: pdf-accolade-wrapper pdf-white-bg`);

                        // For PDF, use CSS classes AND inline styles for maximum compatibility
                        return (
                          <div
                            key={index}
                            className="pdf-accolade-wrapper pdf-white-bg"
                            style={{
                              backgroundColor: "white !important",
                              background: "white !important",
                              borderRadius: "12px",
                              overflow: "hidden",
                              position: "relative",
                              isolation: "isolate", // Create new stacking context
                            }}
                          >
                            {/* Inner card with all the content */}
                            <div
                              className="pdf-accolade-card"
                              style={{
                                backgroundColor: "white !important",
                                background: "white !important",
                                padding: "32px",
                                paddingTop: "0px",
                                minHeight: "200px",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                              }}
                            >
                              {/* Icon container - simplified for PDF */}
                              <div
                                style={{
                                  fontSize: "48px",
                                  marginBottom: "16px",
                                  backgroundColor: "#ffffff",
                                  padding: "8px",
                                  borderRadius: "50%",
                                }}
                              >
                                {displayIcon}
                              </div>

                              {/* Achievement text */}
                              <p
                                style={{
                                  color: "#1f2937",
                                  fontWeight: "600",
                                  textAlign: "center",
                                  fontSize: "18px",
                                  lineHeight: "1.75",
                                  margin: 0,
                                  backgroundColor: "transparent",
                                }}
                              >
                                {typeof accolade === "string" ? accolade : accolade.title}
                              </p>

                              {/* Optional subtitle/description */}
                              {typeof accolade === "object" && accolade.description && (
                                <p
                                  style={{
                                    color: "#6b7280",
                                    fontSize: "14px",
                                    textAlign: "center",
                                    marginTop: "8px",
                                    margin: "8px 0 0 0",
                                    backgroundColor: "transparent",
                                  }}
                                >
                                  {accolade.description}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      }

                      // Regular web rendering with all fancy effects
                      return (
                        <div key={index} className="group relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-glamlink-teal/20 to-glamlink-purple/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 flex flex-col items-center justify-center min-h-[200px]">
                            {/* Icon container with background circle */}
                            <div className="relative mb-4">
                              <div className="absolute inset-0 bg-gradient-to-br from-glamlink-teal/10 to-glamlink-purple/10 rounded-full blur-md" />
                              <div className="relative text-5xl lg:text-6xl transform group-hover:scale-110 transition-transform duration-300">{displayIcon}</div>
                            </div>

                            {/* Achievement text */}
                            <p className="text-gray-800 font-semibold text-center text-lg leading-relaxed">{typeof accolade === "string" ? accolade : accolade.title}</p>

                            {/* Optional subtitle/description if using enhanced structure */}
                            {typeof accolade === "object" && accolade.description && <p className="text-gray-600 text-sm text-center mt-2">{accolade.description}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}

        {/* Photo Gallery */}
        {content.photoGallery && content.photoGallery.images && content.photoGallery.images.length > 0 && (
          <div className={`max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8 ${galleryBgProps.className || ""}`} style={galleryBgProps.style}>
            <h3 className="text-3xl font-bold text-center mb-8 text-gray-900">{content.photoGallery.title || "Gallery"}</h3>
            <div className={`grid grid-cols-1 ${isPdfExport ? "" : "xl:grid-cols-3"} gap-6`}>
              {content.photoGallery.images.map((image: any, index: number) => {
                // Log PDF mode gallery rendering
                if (isPdfExport && index === 0) {
                  console.log("Rendering photo gallery in PDF mode with natural aspect ratios");
                }

                return (
                  <div key={index} className="group">
                    {/* Use different layouts for different screen sizes or PDF export */}
                    <div className={isPdfExport ? "block" : "block xl:hidden"}>
                      {/* Mobile, tablet, and PDF: Full width with natural aspect ratio */}
                      <div className="w-full overflow-hidden rounded-lg shadow-md bg-gray-100">
                        <Image
                          src={getImageUrl(image.url) || "/images/placeholder.png"}
                          alt={image.alt || `Gallery image ${index + 1}`}
                          width={1200}
                          height={800}
                          className="w-full h-auto"
                          style={{
                            objectFit: "contain",
                            width: "100%",
                            height: "auto",
                          }}
                          priority={index < 3}
                        />
                      </div>
                    </div>
                    {!isPdfExport && (
                      <div className="hidden xl:block">
                        {/* Desktop (non-PDF): Keep original fixed aspect ratio */}
                        <div className="relative w-full aspect-square overflow-hidden rounded-lg shadow-md bg-gray-100">
                          <Image
                            src={getImageUrl(image.url) || "/images/placeholder.png"}
                            alt={image.alt || `Gallery image ${index + 1}`}
                            fill
                            sizes="33vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            style={{
                              objectPosition: getImageObjectPosition(image.url),
                            }}
                            priority={index < 3}
                          />
                        </div>
                      </div>
                    )}
                    {image.caption && <p className="mt-2 text-sm text-gray-600 text-center">{image.caption}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Social Links Footer */}
        {content.socialLinks &&
          (() => {
            // Helper function to check if a link has a valid URL or action
            const hasValidUrl = (link: any): boolean => {
              if (!link) return false;
              if (typeof link === "string") {
                const trimmed = link.trim();
                return trimmed !== "" && trimmed !== "#";
              }
              if (typeof link === "object" && "url" in link) {
                // Check if it has a modal action - this is valid even with '#' URL
                if (link.action === "pro-popup" || link.action === "user-popup") {
                  return true;
                }
                // Otherwise check the URL normally
                const url = link.url;
                if (!url) return false;
                const trimmed = url.trim();
                return trimmed !== "" && trimmed !== "#";
              }
              return false;
            };

            // Check if any social links have valid URLs
            const hasAnyValidLinks = hasValidUrl(content.socialLinks.instagram) || hasValidUrl(content.socialLinks.website) || hasValidUrl(content.socialLinks.glamlinkProfile);

            // Debug logging for PDF export
            if (isPdfExport) {
              console.log("RisingStar social links check in PDF mode:");
              console.log("  Instagram:", content.socialLinks.instagram, "→ valid:", hasValidUrl(content.socialLinks.instagram));
              console.log("  Website:", content.socialLinks.website, "→ valid:", hasValidUrl(content.socialLinks.website));
              console.log("  Glamlink:", content.socialLinks.glamlinkProfile, "→ valid:", hasValidUrl(content.socialLinks.glamlinkProfile));
              console.log("  Has any valid links:", hasAnyValidLinks);
            }

            // Only render the section if there are valid links
            // If we're in PDF export mode and have no valid links, don't render at all
            if (!hasAnyValidLinks) {
              if (isPdfExport) {
                console.log("RisingStar: Hiding social links section in PDF - no valid URLs");
              }
              return null;
            }

            return (
              <div className={`py-8 ${socialMediaBgProps.className || "bg-gray-100"}`} style={socialMediaBgProps.style}>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
                  <h4 className="text-center text-lg font-semibold text-gray-700 mb-2">Connect with {content.starName}</h4>
                  {content.starName && content.starName.toLowerCase().includes("christina") && <p className="text-center text-sm text-gray-600 mb-4">Use referral code @glamiconicaestheticbychristina when signing up!</p>}
                  <div className="flex justify-center gap-6">
                    {hasValidUrl(content.socialLinks.instagram) && (
                      <PDFImageLink
                        href={typeof content.socialLinks.instagram === "string" ? content.socialLinks.instagram : content.socialLinks.instagram?.url || "#"}
                        action={typeof content.socialLinks.instagram === "object" ? content.socialLinks.instagram?.action : undefined}
                        pdfImageSrc="/pdf-content/instagram-button.png"
                        pdfImageAlt="Book Now on Glamlink"
                        className="px-6 py-2 bg-black text-white rounded-full shadow-md hover:shadow-lg transition-all hover:bg-gray-800"
                        target="_blank"
                        onClick={
                          typeof content.socialLinks.instagram === "object" && content.socialLinks.instagram?.action === "pro-popup"
                            ? (e) => {
                                e.preventDefault();
                                setShowProDialog(true);
                              }
                            : typeof content.socialLinks.instagram === "object" && content.socialLinks.instagram?.action === "user-popup"
                            ? (e) => {
                                e.preventDefault();
                                setShowUserDialog(true);
                              }
                            : undefined
                        }
                      >
                        Book Now on Glamlink
                      </PDFImageLink>
                    )}
                    {hasValidUrl(content.socialLinks.website) && (
                      <PDFImageLink
                        href={typeof content.socialLinks.website === "string" ? content.socialLinks.website : content.socialLinks.website?.url || "#"}
                        action={typeof content.socialLinks.website === "object" ? content.socialLinks.website?.action : undefined}
                        pdfImageSrc="/pdf-content/website-button.png"
                        pdfImageAlt="Website"
                        className="px-6 py-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow text-gray-700 hover:text-glamlink-teal"
                        target="_blank"
                      >
                        Website
                      </PDFImageLink>
                    )}
                    {hasValidUrl(content.socialLinks.glamlinkProfile) && (
                      <PDFImageLink
                        href={typeof content.socialLinks.glamlinkProfile === "string" ? content.socialLinks.glamlinkProfile : content.socialLinks.glamlinkProfile?.url || "#"}
                        action={typeof content.socialLinks.glamlinkProfile === "object" ? content.socialLinks.glamlinkProfile?.action : undefined}
                        pdfImageSrc="/pdf-content/glamlink-button.png"
                        pdfImageAlt="Join Glamlink as a Pro"
                        className="px-6 py-2 bg-glamlink-teal text-white rounded-full shadow-md hover:shadow-lg transition-shadow hover:bg-glamlink-teal-dark"
                        target="_self"
                        onClick={
                          typeof content.socialLinks.glamlinkProfile === "object" && content.socialLinks.glamlinkProfile?.action === "pro-popup"
                            ? (e) => {
                                e.preventDefault();
                                setShowProDialog(true);
                              }
                            : typeof content.socialLinks.glamlinkProfile === "object" && content.socialLinks.glamlinkProfile?.action === "user-popup"
                            ? (e) => {
                                e.preventDefault();
                                setShowUserDialog(true);
                              }
                            : undefined
                        }
                      >
                        Join Glamlink as a Pro
                      </PDFImageLink>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
      </div>

      {/* Download Dialogs */}
      {showProDialog && <ProDownloadDialog isOpen={showProDialog} onClose={() => setShowProDialog(false)} />}

      {showUserDialog && <UserDownloadDialog isOpen={showUserDialog} onClose={() => setShowUserDialog(false)} />}
    </>
  );
}