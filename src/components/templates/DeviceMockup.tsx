import React from 'react';

interface DeviceMockupProps {
  type: 'desktop' | 'tablet' | 'mobile';
  imageUrl?: string;
  altText?: string;
  className?: string;
}

// Device Mockup Component - Custom CSS-based device frames
const DeviceMockup: React.FC<DeviceMockupProps> = ({ 
  type, 
  imageUrl, 
  altText = 'Template preview', 
  className = '' 
}) => {
  const deviceClass = `device-mockup-${type}`;
  
  return (
    <div className={`${deviceClass} ${className}`}>
      <div className="screen">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={altText}
            className="template-image"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
            <span className="text-sm">Template Preview</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Multi-device preview component
export const MultiDevicePreview: React.FC<{
  desktopImage?: string;
  tabletImage?: string;
  mobileImage?: string;
  title?: string;
}> = ({ desktopImage, tabletImage, mobileImage, title = 'Template Preview' }) => {
  return (
    <div className="device-mockup-container">
      <div className="device-grid">
        <DeviceMockup 
          type="desktop" 
          imageUrl={desktopImage} 
          altText={`${title} - Desktop view`}
        />
        <DeviceMockup 
          type="tablet" 
          imageUrl={tabletImage} 
          altText={`${title} - Tablet view`}
        />
        <DeviceMockup 
          type="mobile" 
          imageUrl={mobileImage} 
          altText={`${title} - Mobile view`}
        />
      </div>
    </div>
  );
};

export default DeviceMockup;