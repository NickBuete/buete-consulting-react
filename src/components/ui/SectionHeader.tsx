/**
 * SectionHeader Component
 * Reusable section header with title, description, and optional decorative line
 */

import React from 'react';

interface SectionHeaderProps {
  title: string;
  description?: string;
  alignment?: 'left' | 'center';
  showDecorator?: boolean;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  description,
  alignment = 'center',
  showDecorator = true,
  className = '',
}) => {
  const alignmentClasses = alignment === 'center' ? 'text-center mx-auto' : 'text-left';

  return (
    <div className={`mb-16 ${alignmentClasses} ${className}`}>
      <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
        {title}
      </h2>
      {showDecorator && (
        <div className={`w-20 h-1 bg-gradient-to-r from-brand-600 to-orange-500 rounded-full mb-6 ${
          alignment === 'center' ? 'mx-auto' : ''
        }`} />
      )}
      {description && (
        <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;
