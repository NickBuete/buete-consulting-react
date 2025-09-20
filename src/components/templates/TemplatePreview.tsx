import React from 'react';

const TemplatePreview: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      {/* Template preview modal implementation */}
      <div className="bg-white p-6 rounded-lg max-w-4xl mx-auto mt-10">
        <p>Template Preview Component</p>
      </div>
    </div>
  );
};

export default TemplatePreview;
