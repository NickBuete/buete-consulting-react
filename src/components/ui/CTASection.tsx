import React from 'react';
import { Button } from './Button';

interface CTASectionProps {
    title: string;
    subtitle: string;
    primaryCTA: {
        text: string;
        link: string;
    };
    secondaryCTA?: {
        text: string;
        link: string;

    };
    variant?: 'default' | 'primary' | 'accent' | 'secondary';
}

const CTASection: React.FC<CTASectionProps> = ({
    title, 
    subtitle,
    primaryCTA,
    secondaryCTA,
    variant = 'default'
}) => {
    return (
        <section className={`py-16 px-6 ${
            variant === 'primary'
            ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white'
            : variant === 'secondary'
            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
            : 'bg-gray-50'
        }`}>
            <div className="max-w-4xl mx-auto text-center">
                <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${
                    variant === 'default' ? 'text-gray-900' : 'text-white'
                }`}>
                    {title}
                </h2>
                <p className={`text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed ${
                    variant === 'default' ? 'text-gray-600' : 'text-gray-100'
                }`}>
                    {subtitle}
                </p>
                <div className={`w-20 h-0.5 mx-auto mb-8 rounded-full ${
                    variant === 'default'
                        ? 'bg-gradient-to-r from-brand-500 to-orange-500'
                        : 'bg-white/30'
                }`}></div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                        size="lg"
                        variant={variant === 'default' ? 'default' : 'secondary'}
                        className={`px-8 py-4 transition-all duration-200 hover:scale-105 hover:-translate-y-1 min-w-[180px] ${
                            variant !== 'default' ? 'bg-white text-gray-900 hover:bg-gray-100 border-0' : ''
                        }`}
                        onClick={() => window.open(primaryCTA.link, "_blank")}
                        >
                        {primaryCTA.text}
                    </Button>
                    {secondaryCTA && (
                        <Button
                            variant="outline"
                            size="lg"
                            className={`px-8 py-4 transition-all duration-200 hover:scale-105 hover:-translate-y-1 min-w-[180px] ${
                                variant !== 'default' 
                                    ? 'border-2 border-white text-white bg-transparent hover:bg-white hover:text-gray-900' 
                                    : ''
                            }`}
                            onClick={() => window.open(secondaryCTA.link, "_blank")}
                            >
                            {secondaryCTA.text}
                        </Button>
                    )}
                </div>
            </div>
        </section>
    );
};

export default CTASection;
