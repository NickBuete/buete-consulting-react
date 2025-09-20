import React from 'react';
import { PageHero, ValueCard, CTASection, ContactForm } from '../../components/ui';

const ContactPage: React.FC = () => {
    return (
        <>
            <PageHero
                title="Get in touch"
                subtitle="Ready to transform your healthcare practice? Let's connect"
                backgroundVariant="minimal"
            />
            {/* Main Contact Section */}
            <section className="py-16 lg:py-24 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        
                        {/* Contact Form */}
                        <div>
                            <ContactForm 
                                title="Send us a message"
                                onSubmit={(data) => {
                                    console.log('Form submitted:', data);
                                    // TODO: Integrate with form service
                                }}
                            />
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-8">Contact Information</h2>
                            <ValueCard
                                icon="📧"
                                title="Email Us"
                                description="hello@bueteconsulting.com.au - We typically respond within 24 hours"
                            />
                            <ValueCard
                                icon="📞"
                                title="Call Us"
                                description="+61 XXX XXX XXX - Available Monday to Friday, 9am to 5pm AEST"
                            />
                            <ValueCard
                                icon="📍"
                                title="Location"
                                description="Based in Australia, serving healthcare professionals globally"
                            />
                        </div>
                    </div>
                </div>
            </section>
            {/* Call to Action Section */}
            <CTASection
            title="Prefer to explore first?"
            subtitle="Check out our templates and tools before getting in tough"
            primaryCTA={{
                text: "Browse Templates",
                link: "/templates"
            }}
            variant="default"
            />
        </>
    )
};

export default ContactPage;
