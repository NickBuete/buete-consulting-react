/**
 * Templates Page - Modern & Brand-Themed
 * Website template browser with filters and search
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import TemplateHero from '../../components/templates/TemplateHero';
import TemplateFilters from '../../components/templates/TemplateFilters';
import TemplateGrid from '../../components/templates/TemplateGrid';
import { CTASection } from '../../components/ui';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Button } from '../../components/ui/Button';
import { Template } from '../../types/template';
import { useTemplateFilters } from '../../hooks/useTemplateFilters';
import { Rocket, Code2, Zap, ArrowRight } from 'lucide-react';

const TemplatesPage: React.FC = () => {
  const [templates] = useState<Template[]>([]);
  const isLoading = false; // Set to true when actually loading

  const { filters, updateFilters, clearFilters, filteredTemplates } =
    useTemplateFilters(templates);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <TemplateHero
        totalTemplates={templates.length}
        featuredTemplatesCount={
          templates.filter((t) => t.status === 'featured').length
        }
        onSearch={(query) => updateFilters({ searchQuery: query })}
        onCategoryFilter={(category) => {
          if (category === 'all') {
            updateFilters({ categories: [] });
          } else {
            updateFilters({ categories: [category] });
          }
        }}
      />

      {/* Coming Soon / Empty State */}
      {templates.length === 0 && !isLoading && (
        <section className="py-20 bg-gradient-to-br from-neutral-50 to-brand-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <SectionHeader
              title="Templates Coming Soon"
              description="We're working on professional, customizable templates for healthcare practices"
            />

            <div className="bg-white rounded-2xl p-12 shadow-lg mb-12">
              <Rocket className="w-24 h-24 text-brand-600 mx-auto mb-8" />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                In the Meantime, Let's Build Your Custom Site
              </h3>
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Why wait for a template when we can build exactly what you need?
                Custom websites offer unlimited flexibility, perfect fit, and professional results.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <Code2 className="w-12 h-12 text-brand-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">Custom Built</h4>
                  <p className="text-sm text-gray-600">
                    Tailored specifically to your practice's unique needs
                  </p>
                </div>

                <div className="text-center">
                  <Zap className="w-12 h-12 text-orange-500 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">Fast Delivery</h4>
                  <p className="text-sm text-gray-600">
                    Typically 4-8 weeks from start to launch
                  </p>
                </div>

                <div className="text-center">
                  <Rocket className="w-12 h-12 text-brand-600 mx-auto mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">Better Results</h4>
                  <p className="text-sm text-gray-600">
                    SEO-optimized, fast, and built to grow with you
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-brand-600 hover:bg-brand-700">
                  <Link to="/contact" className="flex items-center">
                    Get Started with Custom
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/about">Learn More About Us</Link>
                </Button>
              </div>
            </div>

            {/* Notification Signup */}
            <div className="bg-gradient-to-r from-brand-600 to-orange-500 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-3">Want to Know When Templates Launch?</h3>
              <p className="text-brand-100 mb-6">
                Join our waitlist and be the first to know when our healthcare templates are ready
              </p>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white bg-white/10 hover:bg-white hover:text-brand-900"
                asChild
              >
                <Link to="/contact">Join the Waitlist</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Main Content Area - When templates exist */}
      {templates.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Filters */}
            <div className="lg:col-span-1">
              <TemplateFilters
                selectedCategories={filters.categories}
                selectedFeatures={filters.features}
                onCategoryChange={(categories) => updateFilters({ categories })}
                onFeatureChange={(features) => updateFilters({ features })}
                onResetFilters={clearFilters}
                showFeatures={true}
                showClearButton={true}
              />
            </div>

            {/* Main Content - Template Grid */}
            <div className="lg:col-span-3">
              <TemplateGrid
                templates={filteredTemplates}
                isLoading={isLoading}
                onPreview={(template) => {
                  console.log('Preview template:', template);
                }}
                onDownload={(template) => {
                  console.log('Download template:', template);
                }}
                emptyStateTitle="No Templates Found"
                emptyStateMessage="Try adjusting your search or filters to find the perfect template."
              />
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <CTASection
        title="Need a Custom Solution?"
        subtitle="Can't find what you're looking for? We specialize in building custom healthcare websites from scratch"
        primaryCTA={{
          text: "Get a Custom Website",
          link: "/contact"
        }}
        secondaryCTA={{
          text: "Explore Our Work",
          link: "/about"
        }}
        variant="primary"
      />
    </div>
  );
};

export default TemplatesPage;
