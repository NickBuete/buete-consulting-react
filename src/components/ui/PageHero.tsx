import React from "react";
import { Button } from "./Button";

interface PageHeroProps {
  title: string;
  subtitle: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  backgroundVariant?: "gradient" | "solid" | "minimal";
}

const PageHero: React.FC<PageHeroProps> = ({
  title,
  subtitle,
  description,
  ctaText,
  ctaLink,
  backgroundVariant = "gradient",
}) => {
  return (
    <section
      className={`relative py-20 px-6 ${
        backgroundVariant === "gradient"
          ? "bg-gradient-to-br from-brand-50 via-white to-orange-50"
          : backgroundVariant === "solid"
          ? "bg-brand-600 text-white"
          : "bg-white"
      }`}
    >
      <div className="max-w-4xl mx-auto text-center">
        <h1
          className={`text-4xl md:text-6xl font-bold mb-6 ${
            backgroundVariant === "solid" ? "text-white" : "text-gray-900"
          }`}
        >
          {title}
        </h1>
        <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-brand-500 mx-auto mb-6 rounded-full"></div>
        <p
          className={`text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed ${
            backgroundVariant === "solid" ? "text-gray-100" : "text-gray-600"
          }`}
        >
          {subtitle}
        </p>
        {ctaText && (
          <div className="animate-pulse">
            <Button
              size="lg"
              className="text-lg px-8 py-4 transition-transform hover:scale-105"
              onClick={() => ctaLink && window.open(ctaLink, "_blank")}
            >
              {ctaText}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default PageHero;
