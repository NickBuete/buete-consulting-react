/**
 * About Page - Modern & Brand-Themed
 * Showcases company story, mission, vision, values, and expertise
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ValueCard, CTASection } from '../../components/ui';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Button } from '../../components/ui/Button';
import { ArrowRight, Users, Target, Eye, Heart, Code2, Briefcase, Award } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <>
      {/* Hero Section - Modern Design */}
      <section className="relative bg-gradient-to-br from-brand-900 via-brand-700 to-brand-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
              About Buete Consulting
              <span className="block text-orange-400 mt-2">Healthcare Innovation Through Code</span>
            </h1>
            <p className="text-xl lg:text-2xl text-neutral-100 mb-8 leading-relaxed">
              Transforming healthcare practices with custom digital solutions built from scratch.
              No templates, no compromises—just professional code tailored to your needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" variant="default" className="bg-orange-500 text-white hover:bg-orange-600 font-semibold shadow-lg">
                <Link to="/contact" className="flex items-center">
                  Work With Us
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-brand-900 font-semibold">
                <Link to="/templates">View Our Work</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Company Story Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <SectionHeader
                title="Our Story"
                description="From observation to innovation—how we're changing healthcare technology"
                alignment="left"
              />
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Founded with a vision to bridge the gap between healthcare needs and technology solutions,
                  Buete Consulting specializes in creating tailored digital experiences for healthcare professionals.
                </p>
                <p>
                  Our journey began with a simple observation: healthcare professionals needed better tools,
                  more efficient workflows, and professional digital presence that truly represented their expertise.
                </p>
                <p>
                  Today, we combine deep healthcare industry knowledge with cutting-edge web development
                  to deliver solutions that make a real difference in healthcare practices across Australia and beyond.
                </p>
              </div>
            </div>

            {/* Visual Element */}
            <div className="relative">
              <div className="aspect-square max-w-md mx-auto relative">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-100 to-orange-100 rounded-3xl transform rotate-3" />
                <div className="absolute inset-0 bg-gradient-to-br from-brand-600 to-orange-500 rounded-3xl flex items-center justify-center text-white">
                  <div className="text-center p-8">
                    <Users className="w-24 h-24 mx-auto mb-6" />
                    <h3 className="text-3xl font-bold mb-2">Healthcare First</h3>
                    <p className="text-brand-100 text-lg">Technology Second</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values Section */}
      <section className="py-20 bg-gradient-to-br from-neutral-50 to-brand-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Our Foundation"
            description="The core principles that guide everything we do and every solution we create"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-brand-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Mission</h3>
              <div className="w-12 h-1 bg-gradient-to-r from-brand-600 to-orange-500 rounded-full mb-4" />
              <p className="text-gray-600 leading-relaxed">
                To empower healthcare professionals with innovative digital solutions that enhance patient care
                and streamline practice operations through custom-coded excellence.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                <Eye className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Vision</h3>
              <div className="w-12 h-1 bg-gradient-to-r from-brand-600 to-orange-500 rounded-full mb-4" />
              <p className="text-gray-600 leading-relaxed">
                A healthcare industry where technology seamlessly supports providers, enabling them to focus
                entirely on what matters most: their patients.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mb-6">
                <Heart className="w-8 h-8 text-brand-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Values</h3>
              <div className="w-12 h-1 bg-gradient-to-r from-brand-600 to-orange-500 rounded-full mb-4" />
              <p className="text-gray-600 leading-relaxed">
                Excellence, integrity, and innovation in every project. We believe in building lasting
                partnerships based on trust and measurable results.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Expertise Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Our Expertise"
            description="Specialized knowledge and proven experience across the healthcare technology landscape"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ValueCard
              icon="🏥"
              title="Healthcare Workflow Optimization"
              description="Deep understanding of healthcare processes, helping streamline operations and improve efficiency in clinical settings."
            />
            <ValueCard
              icon="💻"
              title="Professional Web Development"
              description="Custom websites and applications built with modern technologies, designed specifically for healthcare professionals and practices."
            />
            <ValueCard
              icon="💊"
              title="Pharmacy Solutions"
              description="Specialized tools and calculators designed for pharmacy operations, from dose calculations to clinical decision support."
            />
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-gradient-to-br from-neutral-50 to-brand-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Why Choose Buete Consulting"
            description="What sets us apart in healthcare technology"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <Code2 className="w-10 h-10 text-brand-600 mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Custom Code, Not Templates</h4>
              <p className="text-gray-600 text-sm">
                Every solution built from scratch to perfectly fit your practice's unique needs.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <Briefcase className="w-10 h-10 text-orange-600 mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Healthcare Industry Focus</h4>
              <p className="text-gray-600 text-sm">
                Specialized expertise in pharmacy, medical, and allied health workflows.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <Award className="w-10 h-10 text-brand-600 mb-4" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Quality & Performance</h4>
              <p className="text-gray-600 text-sm">
                Fast, secure, SEO-optimized solutions that perform at the highest level.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection
        title="Ready to Work Together?"
        subtitle="Let's discuss how we can help transform your healthcare practice with our professional solutions"
        primaryCTA={{
          text: "Get in Touch",
          link: "/contact"
        }}
        secondaryCTA={{
          text: "View Our Work",
          link: "/templates"
        }}
        variant="primary"
      />
    </>
  );
};

export default AboutPage;
