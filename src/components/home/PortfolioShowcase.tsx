/**
 * PortfolioShowcase Component
 * Displays portfolio websites with tech stack and features
 */

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { ExternalLink, Zap } from 'lucide-react';

interface ProjectTag {
  label: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'indigo';
}

interface PortfolioProject {
  title: string;
  clientType: string;
  description: string;
  image: string;
  liveUrl: string;
  tags: ProjectTag[];
  features: string[];
  performanceNote?: string;
}

const tagColors = {
  blue: 'bg-blue-100 text-blue-700',
  green: 'bg-green-100 text-green-700',
  purple: 'bg-purple-100 text-purple-700',
  orange: 'bg-orange-100 text-orange-700',
  pink: 'bg-pink-100 text-pink-700',
  indigo: 'bg-indigo-100 text-indigo-700',
};

const projects: PortfolioProject[] = [
  {
    title: 'Gardens Pharmacy',
    clientType: 'Community Pharmacy',
    description:
      'Full-featured pharmacy website with custom booking system, medication management, compounding services, and integrated clinical tools.',
    image: '/portfolio/gardens-pharmacy-hero.png', // You'll need to add this
    liveUrl: 'https://gardenspharmacy.com.au',
    performanceNote: 'Optimized for speed & SEO',
    tags: [
      { label: 'Next.js 15', color: 'blue' },
      { label: 'TypeScript', color: 'blue' },
      { label: 'Supabase', color: 'green' },
      { label: 'Stripe', color: 'purple' },
      { label: 'AWS S3', color: 'orange' },
      { label: 'Tailwind CSS', color: 'indigo' },
    ],
    features: [
      'Custom booking system for consultations & services',
      'Medication management & dose calendar tools',
      'Compounding services portal',
      'Secure patient document storage (AWS S3)',
      'Stripe payment integration',
      'Admin dashboard with analytics',
      'Clinical Medication Information (CMI) database',
      'PDF report generation',
      'Mobile-responsive design',
      'Advanced authentication & role management',
    ],
  },
];

export const PortfolioShowcase: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Real Projects, Real Results
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See what's possible when you build from code instead of forcing templates to fit
          </p>
        </div>

        <div className="space-y-12">
          {projects.map((project, index) => (
            <Card
              key={index}
              className="overflow-hidden border-2 hover:border-blue-200 transition-all hover:shadow-xl"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Image Section */}
                <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 p-8 lg:p-12 flex items-center justify-center">
                  <div className="relative w-full max-w-md">
                    {/* Placeholder - replace with actual screenshot */}
                    <div
                      className="aspect-[4/3] bg-white rounded-lg shadow-2xl border-4 border-gray-200 flex items-center justify-center overflow-hidden"
                      role="img"
                      aria-label={`${project.title} website preview placeholder`}
                    >
                      <div className="text-center p-8">
                        <div className="text-6xl mb-4" aria-hidden="true">🏥</div>
                        <div className="text-gray-600 font-medium">
                          {project.title}
                        </div>
                        <div className="text-sm text-gray-500 mt-2">
                          Screenshot coming soon
                        </div>
                      </div>
                    </div>
                    {/* Desktop mockup frame overlay - optional enhancement */}
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-8 lg:p-12">
                  <CardHeader className="p-0 mb-6">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <CardTitle className="text-3xl mb-2">
                          {project.title}
                        </CardTitle>
                        <p className="text-blue-600 font-medium">
                          {project.clientType}
                        </p>
                      </div>
                      {project.performanceNote && (
                        <div className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                          <Zap className="w-4 h-4" />
                          {project.performanceNote}
                        </div>
                      )}
                    </div>
                    <p className="text-gray-600 text-lg leading-relaxed">
                      {project.description}
                    </p>
                  </CardHeader>

                  <CardContent className="p-0 space-y-6">
                    {/* Tech Stack Tags */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                        Tech Stack
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              tagColors[tag.color]
                            }`}
                          >
                            {tag.label}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Key Features */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                        Key Features
                      </h4>
                      <ul className="grid grid-cols-1 gap-2">
                        {project.features.slice(0, 6).map((feature, featureIndex) => (
                          <li
                            key={featureIndex}
                            className="flex items-start text-gray-600"
                          >
                            <span className="text-green-600 mr-2 mt-1">✓</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                        {project.features.length > 6 && (
                          <li className="text-gray-500 italic ml-6">
                            + {project.features.length - 6} more features...
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* CTA Button */}
                    <div className="pt-4">
                      <Button
                        size="lg"
                        asChild
                        className="w-full sm:w-auto group"
                      >
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center"
                        >
                          View Live Site
                          <ExternalLink className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Optional: Add more projects CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600">
            Want a custom website like this for your practice?{' '}
            <a
              href="/contact"
              className="text-blue-600 hover:text-blue-700 font-medium underline"
            >
              Let's talk about your project
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};
