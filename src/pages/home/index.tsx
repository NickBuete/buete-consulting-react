/**
 * Home Page - Redesigned
 * Modern landing page focusing on custom healthcare websites and pharmacy tools
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { ToolSuggestionForm } from '../../components/home/ToolSuggestionForm';
import { PortfolioShowcase } from '../../components/home/PortfolioShowcase';
import {
  Code2,
  Zap,
  Shield,
  TrendingUp,
  Palette,
  Lock,
  Calculator,
  Calendar,
  FileText,
  Users,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';

const HomePage: React.FC = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-900 via-brand-700 to-brand-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
              Custom Healthcare Websites
              <span className="block text-orange-400 mt-2">Built from Code, Not Templates</span>
            </h1>
            <p className="text-xl lg:text-2xl text-neutral-100 mb-8 leading-relaxed">
              Professional websites for pharmacies, GP clinics, and allied health practices.
              No compromises, no forcing templates to fit. Just clean, custom code that works exactly how you need it.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" variant="default" className="bg-orange-500 text-white hover:bg-orange-600 font-semibold shadow-lg">
                <Link to="/contact" className="flex items-center">
                  Get Your Custom Website
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-white text-brand-900 hover:bg-orange-600 hover:text-white hover:border-orange-600 font-semibold">
                <Link to="/tools">Explore Free Tools</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits of Custom Code Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Custom Code Beats Templates
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              WordPress, Webflow, and WYSIWYG builders force you to compromise.
              Custom code gives you exactly what you need.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-brand-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Code2 className="w-12 h-12 text-brand-600 mb-4" />
                <CardTitle>Perfect Fit, Every Time</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  No wrestling with page builders or settling for "close enough."
                  Your website works exactly how your practice needs it to work.
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-100 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Zap className="w-12 h-12 text-green-600 mb-4" />
                <CardTitle>Lightning Fast Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  No bloated plugins or unnecessary code. Clean, optimized websites
                  that load instantly and rank higher in search engines.
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-100 hover:shadow-lg transition-shadow">
              <CardHeader>
                <TrendingUp className="w-12 h-12 text-purple-600 mb-4" />
                <CardTitle>Unlimited Scalability</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Start simple, grow complex. Add booking systems, patient portals,
                  or custom integrations without hitting template limitations.
                </p>
              </CardContent>
            </Card>

            <Card className="border-orange-100 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="w-12 h-12 text-orange-600 mb-4" />
                <CardTitle>Healthcare-Grade Security</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Built with security in mind from day one. No vulnerable plugins,
                  no unnecessary access points. Your patients' trust protected.
                </p>
              </CardContent>
            </Card>

            <Card className="border-pink-100 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Palette className="w-12 h-12 text-pink-600 mb-4" />
                <CardTitle>True Brand Expression</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Your brand, your colors, your personality. Not a template with
                  your logo slapped on top. Authentic professional presentation.
                </p>
              </CardContent>
            </Card>

            <Card className="border-indigo-100 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Lock className="w-12 h-12 text-indigo-600 mb-4" />
                <CardTitle>You Own Everything</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  No monthly fees to keep your site online. No vendor lock-in.
                  Full ownership of your code, your content, your digital presence.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Portfolio Showcase */}
      <PortfolioShowcase />

      {/* Services Focus Section */}
      <section className="py-20 bg-gradient-to-br from-neutral-50 to-brand-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Specialized Healthcare Websites
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Deep understanding of pharmacy, medical, and allied health practice needs
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl">💊</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Pharmacy Websites</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Professional service pages (Webster-paks, dose administration aids, clinical services)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Integration with pharmacy management systems</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Online booking for medication reviews and consultations</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Built-in clinical calculators and resources</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl">🩺</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">GP & Medical Clinics</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Patient appointment booking systems</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Service showcase (chronic disease management, vaccinations, procedures)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Team profiles and credentials</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Patient resources and health information</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl">🏥</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Allied Health Practices</h3>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Physiotherapy, OT, dietetics, psychology practices</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Telehealth integration and online consultations</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">NDIS and care plan management features</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Referral systems and practitioner communication</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pharmacy Tools Showcase */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Free Pharmacy & Clinical Tools
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Professional calculators and resources to support your daily practice
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <Link to="/tools/dose-calendar" className="group">
              <Card className="h-full border-2 border-transparent hover:border-brand-300 transition-all hover:shadow-lg">
                <CardHeader>
                  <Calendar className="w-10 h-10 text-brand-600 mb-3 group-hover:scale-110 transition-transform" />
                  <CardTitle className="group-hover:text-brand-600 transition-colors">
                    Dose Calendar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Create clear medication schedules for patients. Perfect for complex regimens and dose administration aids.
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/tools/calculators" className="group">
              <Card className="h-full border-2 border-transparent hover:border-orange-300 transition-all hover:shadow-lg">
                <CardHeader>
                  <Calculator className="w-10 h-10 text-orange-600 mb-3 group-hover:scale-110 transition-transform" />
                  <CardTitle className="group-hover:text-orange-600 transition-colors">
                    Clinical Calculators
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Renal dosing, BMI, eGFR, and more. Evidence-based calculations at your fingertips.
                  </p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/tools/hmr" className="group">
              <Card className="h-full border-2 border-transparent hover:border-brand-300 transition-all hover:shadow-lg">
                <CardHeader>
                  <FileText className="w-10 h-10 text-brand-600 mb-3 group-hover:scale-110 transition-transform" />
                  <CardTitle className="group-hover:text-brand-600 transition-colors">
                    HMR Tools
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Streamlined Home Medicine Review documentation. Save time, deliver better patient outcomes.
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>

          <div className="text-center">
            <Button size="lg" asChild>
              <Link to="/tools" className="flex items-center justify-center">
                View All Tools
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Tool Suggestion Section */}
      <section className="py-20 bg-gradient-to-br from-brand-900 to-brand-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Users className="w-16 h-16 mx-auto mb-6 text-orange-400" />
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Suggest a Calculator or Tool
            </h2>
            <p className="text-xl text-neutral-100">
              Have an idea for a clinical calculator or pharmacy tool that would make your practice easier?
              Let us know and we'll consider building it!
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-2xl">
            <ToolSuggestionForm />
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            Ready for a Website That Actually Works?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Stop compromising with templates. Get a custom-coded website built specifically
            for your pharmacy, clinic, or allied health practice.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/contact" className="flex items-center">
                Start Your Project
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/about">Learn More About Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
