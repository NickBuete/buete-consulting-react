import React from 'react';
import { PageHero } from '../../components/ui';
import { ParkinsonsTitrationTool } from '../../components/pharmacy-calculators/parkinsons-titration';

const ParkinsonsTitrationPage: React.FC = () => {
  return (
    <>
      <PageHero
        title="Parkinson's Disease Titration Planner"
        subtitle="Complex multi-medication titration scheduling"
        description="Plan and manage Parkinson's disease medication titrations with support for multiple daily doses, cross-titration between medications, and printable patient schedules."
        backgroundVariant="gradient"
      />

      <section className="py-12 lg:py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <ParkinsonsTitrationTool />
        </div>
      </section>
    </>
  );
};

export default ParkinsonsTitrationPage;
