import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../ui';
import { ROUTES } from '../../router/routes';

const Footer: React.FC = () => {
    return (
        <footer className="bg-brand-900 text-neutral-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Column 1: Logo */}
                    <div className="md:col-span-1">
                        <div className="mb-4">
                            <Logo size="md" showText={true} className="text-white" />
                        </div>
                        <p className="text-orange-400 text-sm font-medium mb-4">Healthcare Solutions
                        </p>

                        <p className="text-neutral-300 text-sm leading-relaxed">
                           Professional website templates, pharmacy tools, 
                            and clinical consulting services tailored for healthcare professionals
                        </p>
                    </div>
                    {/* Services Column */}
                    <div className="md:col-span-1">
                        <h3 className="text-lg font-semibold text-white mb-4">
                            Services
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <Link
                                to={ROUTES.TEMPLATES} 
                                className="text-neutral-300 hover:text-orange-400 transition-colors duration-200 text-sm">
                                    Website Templates
                                    </Link>
                            </li>
                            <li>
                                <Link to={ROUTES.PHARMACY_TOOLS}
                                className="text-neutral-300 hover:text-orange-400 transition-colors duration-200 text-sm">
                                    Pharmacy Tools
                                    </Link>
                            </li>
                            <li>
                                <Link to={ROUTES.HMR_TEMPLATES}
                                className="text-neutral-300 hover:text-orange-400 transition-colors duration-200 text-sm">
                                    HMR Templates
                                    </Link>
                            </li>
                        </ul>   
                    </div>
                    {/* Company Column */}
                    <div className="md:col-span-1">
                        <h3 className="text-lg font-semibold text-white mb-4">
                            Company
                        </h3>
                        <ul className="space-y-3">
                            <li>
                                <Link to={ROUTES.ABOUT} 
                                className="text-neutral-300 hover:text-orange-400 transition-colors duration-200 text-sm">
                                    About Us
                                </Link>
                            </li>
                        </ul>
                    </div>
                    {/* Contact Column */}
                    <div className="md:col-span-1">
                        <h3 className="text-lg font-semibold text-white mb-4">
                            Contact
                        </h3>
                        <ul className="space-y-3">
                            <li className="text-neutral-300 text-sm">
                                <span className="block">Email:</span>
                                <a href="mailto:nickbuete@bueteconsulting.au" 
                                className="text-orange-400 hover:text-orange-300 transition-colors duration-200">
                                    nickbuete@bueteconsulting.au
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            {/* Footer content can be added here in the future */}
        </footer>
    );
};

export default Footer;