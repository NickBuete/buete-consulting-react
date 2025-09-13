import React from 'react';
// Use SVG from public folder to avoid SVGR processing issues

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  showText = true, 
  className = '' 
}) => {
  const sizeClasses = {
    sm: {
      icon: 'h-8',
      text: 'text-lg',
      container: 'gap-2'
    },
    md: {
      icon: 'h-10',
      text: 'text-xl',
      container: 'gap-3'
    },
    lg: {
      icon: 'h-16',
      text: 'text-3xl',
      container: 'gap-4'
    }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={`flex items-center ${currentSize.container} ${className}`}>
      {/* Logo SVG */}
      <img 
        src="/bc-logo.svg" 
        alt="Buete Consulting Logo" 
        className={`${currentSize.icon} object-contain`}
      />
      
      {/* Logo Text */}
      {showText && (
        <span className={`${currentSize.text} font-bold text-primary-600`}>
          Buete Consulting
        </span>
      )}
    </div>
  );
};

export default Logo;