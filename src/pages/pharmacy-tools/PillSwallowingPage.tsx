import React from "react";
import { PageHero } from "../../components/ui";
import { PillSwallowingTrainer } from "../../components/pharmacy-calculators";

const PillSwallowingPage: React.FC = () => {
  return (
    <>
      <PageHero
        title="Tablet Swallowing Trainer"
        subtitle="A fun, step-by-step program to help kids learn to swallow tablets safely"
        description="Based on evidence-based guidelines from Royal Children's Hospital Melbourne, this interactive training program guides children through progressive levels to build confidence in tablet swallowing."
        backgroundVariant="gradient"
      />
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <PillSwallowingTrainer />
        </div>
      </section>
    </>
  );
};

export default PillSwallowingPage;
