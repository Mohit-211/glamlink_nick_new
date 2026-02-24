'use client';

import React from 'react';

interface PDFImageLinkProps {
  href: string;
  pdfImageSrc?: string;
  pdfImageAlt?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  target?: string;
  rel?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  action?: string; // Support for modal actions like 'pro-popup'
}

/**
 * PDFImageLink - A wrapper component that displays an image button in PDF export mode
 * and a regular styled link/button in web mode
 */
export default function PDFImageLink({
  href,
  pdfImageSrc = '/pdf-content/rising-star-button-1.png',
  pdfImageAlt = 'Click here',
  children,
  className,
  style,
  target = '_blank',
  rel = 'noopener noreferrer',
  onClick,
  action
}: PDFImageLinkProps) {
  // For modal actions, href can be '#' - that's valid
  const isModalAction = action === 'pro-popup' || action === 'user-popup';
  
  // Don't render if href is invalid AND it's not a modal action
  if (!isModalAction && (!href || href === '#' || href.trim() === '')) {
    console.log('PDFImageLink: Skipping render due to invalid href:', href);
    return null;
  }
  
  // Check if we're in PDF export mode
  const isPdfExport = typeof window !== 'undefined' && 
    (document.querySelector('#temp-section-export') || 
     document.querySelector('#magazine-pdf-render-container'));

  if (isPdfExport) {
    // PDF export: Use image button
    // Use the specified image, or fallback if the file doesn't exist
    const actualImageSrc = pdfImageSrc === '/pdf-content/website-button.png' 
                          ? '/pdf-content/rising-star-button-1.png' // Fallback for missing website button
                          : pdfImageSrc;
    
    // For modal actions in PDF, redirect to Linktree since popups don't work in PDFs
    if (isModalAction) {
      return (
        <a
          href="https://linktr.ee/glamlink_app"
          style={{
            display: 'inline-block',
            textDecoration: 'none'
          }}
        >
          <img 
            src={actualImageSrc}
            alt={pdfImageAlt}
            style={{
              display: 'block',
              maxWidth: '200px',
              height: 'auto'
            }}
          />
        </a>
      );
    }
    
    return (
      <a
        href={href}
        style={{
          display: 'inline-block',
          textDecoration: 'none'
        }}
      >
        <img 
          src={actualImageSrc}
          alt={pdfImageAlt}
          style={{
            display: 'block',
            maxWidth: '200px',
            height: 'auto'
          }}
        />
      </a>
    );
  }

  // Regular web: Use styled link with children
  // For modal actions, use a button instead of a link
  if (isModalAction) {
    return (
      <button
        className={className}
        style={{
          ...style,
          cursor: 'pointer',
          border: 'none',
          font: 'inherit',
          textAlign: 'inherit'
          // Removed 'background: none' and 'padding: 0' to allow Tailwind classes to work
        }}
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          e.preventDefault();
          if (onClick) {
            // Cast to anchor event for compatibility
            onClick(e as unknown as React.MouseEvent<HTMLAnchorElement>);
          }
        }}
      >
        {children}
      </button>
    );
  }
  
  return (
    <a
      href={href}
      className={className}
      style={style}
      target={target}
      rel={rel}
      onClick={onClick}
    >
      {children}
    </a>
  );
}