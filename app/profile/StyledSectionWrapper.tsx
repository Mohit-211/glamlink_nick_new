'use client';

import React from 'react';

interface StyledSectionWrapperProps {
  title?: string;
  titleAlignment?: 'left' | 'center' | 'right' | 'center-with-lines';
  children: React.ReactNode;
}

export default function StyledSectionWrapper({
  title,
  titleAlignment = 'left',
  children,
}: StyledSectionWrapperProps) {
  const isCenterWithLines = titleAlignment === 'center-with-lines';
  const alignmentClass =
    titleAlignment === 'center' || isCenterWithLines
      ? 'text-center'
      : titleAlignment === 'right'
        ? 'text-right'
        : 'text-left';

  return (
    <div
      className="rounded-xl p-4"
      style={{ background: 'linear-gradient(135deg, #ffffff, #c3cfe2)' }}
    >
      {title && (
        isCenterWithLines ? (
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-gray-300" />
            <h3 className="text-sm font-semibold text-gray-700 whitespace-nowrap">
              {title}
            </h3>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent via-gray-300 to-gray-300" />
          </div>
        ) : (
          <h3 className={`text-sm font-semibold text-gray-700 mb-3 ${alignmentClass}`}>
            {title}
          </h3>
        )
      )}
      {children}
    </div>
  );
}
