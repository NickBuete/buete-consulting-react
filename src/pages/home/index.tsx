import React from 'react';
import { PageHero, ExpertiseCard, CTASection } from '../../components/ui';

const HomePage: React.FC = () => {
  return (
    <>
      {/* Hero Section */}
      <main>
        <PageHero
          title="Healthcare Solutions That Work"
          subtitle="Professional website templates, pharmacy tools, and clinical consulting services designed specifically for healthcare professionals."
          ctaText="Explore Templates"
          ctaLink="#templates"
          backgroundVariant="gradient"
        />

        {/* Preview Section */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-blue-900 mb-4">
                Built for Healthcare Professionals
              </h2>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                Our platform combines beautiful design with practical functionality, 
                created specifically for the healthcare industry.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <ExpertiseCard
                icon="🌐"
                title="Website Templates"
                description="Professional, responsive templates designed for healthcare practices and consultancies."
              />
              <ExpertiseCard
                icon="💊"
                title="Pharmacy Tools"
                description="Calculators, dose calendars, and clinical tools to support daily pharmacy practice."
              />
              <ExpertiseCard
                icon="📋"
                title="Clinical Consulting"
                description="Home Medicine Review tools and clinical consulting services for healthcare providers."
              />
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <CTASection
          title="Ready to Transform Your Healthcare Practice?"
          subtitle="Join hundreds of healthcare professionals who trust our solutions to streamline their workflow and improve patient care."
          primaryCTA={{
            text: "Get Started Today",
            link: "/templates"
          }}
          secondaryCTA={{
            text: "View Pricing",
            link: "/pricing"
          }}
          variant="primary"
        />
      </main>
    </>
  );
};

export default HomePage;