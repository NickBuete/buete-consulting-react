/**
 * Contact Page - Modern & Brand-Themed
 * Professional contact form with information cards
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { CTASection, ContactForm } from '../../components/ui';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';

const ContactPage: React.FC = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-900 via-brand-700 to-brand-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
              Get in Touch
              <span className="block text-orange-400 mt-2">Let's Build Something Amazing</span>
            </h1>
            <p className="text-xl lg:text-2xl text-neutral-100 mb-8 leading-relaxed">
              Ready to transform your healthcare practice with a custom website or digital solution?
              We're here to help bring your vision to life.
            </p>
          </div>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div>
              <SectionHeader
                title="Send Us a Message"
                description="Fill out the form below and we'll get back to you within 24 hours"
                alignment="left"
              />
              <ContactForm
                onSubmit={(data) => {
                  console.log('Form submitted:', data);
                  // TODO: Integrate with form service
                }}
              />
            </div>

            {/* Contact Information */}
            <div>
              <SectionHeader
                title="Contact Information"
                description="Reach out through any of these channels"
                alignment="left"
              />

              <div className="space-y-6">
                <Card className="border-l-4 border-l-brand-600 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Mail className="w-6 h-6 text-brand-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg mb-2">Email Us</CardTitle>
                        <CardContent className="p-0">
                          <a
                            href="mailto:hello@bueteconsulting.com.au"
                            className="text-brand-600 hover:text-brand-700 font-medium"
                          >
                            hello@bueteconsulting.com.au
                          </a>
                          <p className="text-sm text-gray-600 mt-1">
                            We typically respond within 24 hours
                          </p>
                        </CardContent>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Phone className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg mb-2">Call Us</CardTitle>
                        <CardContent className="p-0">
                          <a
                            href="tel:+61XXXXXXXXX"
                            className="text-orange-600 hover:text-orange-700 font-medium"
                          >
                            +61 XXX XXX XXX
                          </a>
                          <p className="text-sm text-gray-600 mt-1">
                            Monday to Friday, 9am to 5pm AEST
                          </p>
                        </CardContent>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="border-l-4 border-l-brand-600 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-6 h-6 text-brand-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg mb-2">Location</CardTitle>
                        <CardContent className="p-0">
                          <p className="text-gray-700 font-medium">
                            Based in Australia
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            Serving healthcare professionals globally
                          </p>
                        </CardContent>
                      </div>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Clock className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg mb-2">Business Hours</CardTitle>
                        <CardContent className="p-0">
                          <div className="text-sm text-gray-700 space-y-1">
                            <p><span className="font-medium">Mon-Fri:</span> 9:00 AM - 5:00 PM</p>
                            <p><span className="font-medium">Sat-Sun:</span> Closed</p>
                            <p className="text-gray-600 mt-2">Australian Eastern Standard Time (AEST)</p>
                          </div>
                        </CardContent>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What to Expect Section */}
      <section className="py-20 bg-gradient-to-br from-neutral-50 to-brand-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="What Happens Next?"
            description="Our simple process for getting started"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-brand-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-6">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Initial Consultation</h3>
              <p className="text-gray-600">
                We'll schedule a call to discuss your needs, goals, and vision for your healthcare practice.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl mb-6">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Proposal & Planning</h3>
              <p className="text-gray-600">
                We'll create a detailed proposal outlining the solution, timeline, and investment required.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-brand-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Development & Launch</h3>
              <p className="text-gray-600">
                We'll build your custom solution with regular updates, then launch it to the world.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Quick Links Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <SectionHeader
            title="Have Questions?"
            description="Common questions we get from new clients"
          />

          <div className="bg-gradient-to-br from-brand-50 to-orange-50 rounded-2xl p-8 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">How long does a project take?</h4>
                <p className="text-sm text-gray-600">
                  Typically 4-8 weeks depending on complexity and features required.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">What's the investment range?</h4>
                <p className="text-sm text-gray-600">
                  Projects start from $5,000 AUD, with most healthcare websites ranging $8,000-$15,000.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Do you offer ongoing support?</h4>
                <p className="text-sm text-gray-600">
                  Yes, we offer maintenance packages and are available for updates as needed.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Can you work with existing systems?</h4>
                <p className="text-sm text-gray-600">
                  Absolutely! We can integrate with most pharmacy management and booking systems.
                </p>
              </div>
            </div>
          </div>

          <Button size="lg" variant="default" className="bg-brand-600 hover:bg-brand-700">
            <Send className="w-5 h-5 mr-2" />
            Send Us Your Question
          </Button>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection
        title="Prefer to Explore First?"
        subtitle="Check out our portfolio, templates, and free pharmacy tools before getting in touch"
        primaryCTA={{
          text: "View Our Work",
          link: "/templates"
        }}
        secondaryCTA={{
          text: "Explore Free Tools",
          link: "/tools"
        }}
        variant="primary"
      />
    </>
  );
};

export default ContactPage;
