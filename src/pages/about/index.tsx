import React from 'react';
import { ExpertiseCard, ValueCard, CTASection, PageHero } from '../../components/ui';

const AboutPage: React.FC = () => {
    return (
        <>
            <PageHero
                title="About Buete Consulting"
                subtitle="Transforming healthcare through innovative solutions, professional expertise, and a commitment to excellence in every project we deliver."
                backgroundVariant="gradient"
            />

            {/* Company Story Section */}
            <section className="py-16 lg:py-24 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
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
                        <div className="flex justify-center">
                            <div className="w-96 h-96 bg-gradient-to-br from-brand-100 to-orange-100 rounded-2xl flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-6xl mb-4">🏥</div>
                                    <p className="text-gray-600 font-medium">Healthcare Innovation</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mission, Vision, Values Section */}
            <section className="py-16 lg:py-24 bg-gray-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Foundation</h2>
                        <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                            The core principles that guide everything we do and every solution we create.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <ValueCard 
                            icon="🎯" 
                            title="Mission" 
                            description="To empower healthcare professionals with innovative digital solutions that enhance patient care and streamline practice operations."
                        />
                        <ValueCard 
                            icon="👁️" 
                            title="Vision" 
                            description="A healthcare industry where technology seamlessly supports providers, enabling them to focus entirely on what matters most: their patients."
                        />
                        <ValueCard 
                            icon="❤️" 
                            title="Values" 
                            description="Excellence, integrity, and innovation in every project. We believe in building lasting partnerships based on trust and measurable results."
                        />
                    </div>
                </div>
            </section>

            {/* Expertise Section */}
            <section className="py-16 lg:py-24 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Expertise</h2>
                        <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                            Specialized knowledge and proven experience across the healthcare technology landscape.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <ExpertiseCard 
                            icon="🏥" 
                            title="Healthcare Workflow Optimization" 
                            description="Deep understanding of healthcare processes, helping streamline operations and improve efficiency in clinical settings."
                        />
                        <ExpertiseCard 
                            icon="💻"
                            title="Professional Web Development" 
                            description="Custom websites and applications built with modern technologies, designed specifically for healthcare professionals and practices."
                        />
                        <ExpertiseCard
                            icon="💊"
                            title="Pharmacy Solutions"
                            description="Specialized tools and calculators designed for pharmacy operations, from dose calculations to clinical decision support."
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <CTASection
                title="Ready to work together?"
                subtitle="Let's discuss how we can help transform your healthcare practice with our professional solutions."
                primaryCTA={{
                    text: "Get in Touch",
                    link: "/contact"
                }}
                variant="primary"
            />
        </>
    );
};

export default AboutPage;