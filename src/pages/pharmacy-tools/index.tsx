import React from "react";
import {
  PageHero,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
} from "../../components/ui";

const PharmacyToolsPage: React.FC = () => {
  return (
    <>
      <PageHero
        title="Pharmacy Tools"
        subtitle="Essential tools for pharmacy management"
        description="Explore our collection of tools designed to streamline pharmacy operations and enhance patient care."
        backgroundVariant="gradient"
      />
      {/* Tools Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 font-heading">
              Explore Our Pharmacy Tools
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto font-body">
              Discover a range of tools designed to improve pharmacy workflows,
              enhance patient safety, and ensure compliance with industry
              standards.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Add tool cards here */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 font-heading">
                  <span className="text-2xl">💻</span>
                  Creatinine Calculator
                </CardTitle>
                <CardDescription className="font-body">
                  A tool for calculating creatinine clearance using the
                  cockcroft-gault formula.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700 font-body">
                      ✓ Patient Gender:{" "}
                    </p>
                    <p className="text-sm text-gray-700 font-body">
                      ✓ Patient Weight:{" "}
                    </p>
                    <p className="text-sm text-gray-700 font-body">
                      ✓ Patient Age:{" "}
                    </p>
                    <p className="text-sm text-gray-700 font-body">
                      ✓ Serum Creatinine:{" "}
                    </p>
                    <p className="text-sm text-gray-700 font-body">
                      ✓ Calculated Creatinine Clearance:{" "}
                    </p>
                  </div>
                  <Button className="w-full" size="default">
                    Calculate
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 font-heading">
                  <span className="text-2xl">🔄</span>
                  Unit Converter
                </CardTitle>
                <CardDescription className="font-body">
                  Convert between different pharmaceutical units and
                  concentrations. Essential for compounding, IV calculations,
                  and stock management.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700">
                      ✓ mg/mL to % conversions
                    </p>
                    <p className="text-sm text-gray-700">
                      ✓ Units/mL calculations
                    </p>
                    <p className="text-sm text-gray-700">
                      ✓ Ratio strength conversions
                    </p>
                    <p className="text-sm text-gray-700">
                      ✓ Temperature conversions
                    </p>
                  </div>
                  <Button className="w-full" size="default">
                    Launch Converter
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 font-heading">
                  <span className="text-2xl">💊</span>
                  Opioid Conversion Calculator
                </CardTitle>
                <CardDescription className="font-body">
                  Safe and accurate opioid conversion calculations with morphine
                  equivalents. Essential for pain management and opioid rotation
                  protocols.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700">
                      ✓ Morphine equivalent calculations
                    </p>
                    <p className="text-sm text-gray-700">
                      ✓ Cross-tolerance factors
                    </p>
                    <p className="text-sm text-gray-700">
                      ✓ Route conversion ratios
                    </p>
                    <p className="text-sm text-gray-700">
                      ✓ Safety warnings included
                    </p>
                  </div>
                  <Button className="w-full" size="default">
                    Launch Calculator
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 font-heading">
                  <span className="text-2xl">📅</span>
                  Variable Dose Calendar
                </CardTitle>
                <CardDescription className="font-body">
                  Create and manage complex dosing schedules for medications
                  with variable dosing. Perfect for warfarin, chemotherapy, and
                  tapering protocols.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700">
                      ✓ Warfarin dosing schedules
                    </p>
                    <p className="text-sm text-gray-700">
                      ✓ Tapering protocols
                    </p>
                    <p className="text-sm text-gray-700">
                      ✓ Weekly dose variations
                    </p>
                    <p className="text-sm text-gray-700">
                      ✓ Printable calendars
                    </p>
                  </div>
                  <Button className="w-full" size="default">
                    Create Calendar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
};

export default PharmacyToolsPage;
