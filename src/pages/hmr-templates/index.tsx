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

/**
 * HMRTemplatesPage displays downloadable HMR interview and report form templates
 * for streamlining the Home Medicine Review process.
 *
 * @component
 */
const HMRTemplatesPage: React.FC = () => {
  return (
    <>
      <PageHero
        title="HMR Templates System"
        subtitle="Professional HMR templates and forms"
        description="Download and customise our interview and report forms to streamline your HMR process"
        backgroundVariant="gradient"
      />

      {/* Download Forms Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Download Our HMR Interview and Report Forms
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Simplify your HMR process with our professionally designed
              interview and report forms. These templates are fully customisable
              to fit your practice's needs.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Add cards later */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <span className="text-2xl">HMR Interview Form</span>
                </CardTitle>
                <CardDescription>
                  Comprehensive patient interview template designed for Home
                  Medicine Reviews. Includes sections for medication history,
                  adherence assessment, and clinical observations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>File Type: Document</span>
                    <span>Size: ~2 pages</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700">
                      Section 1: Patient Information
                    </p>
                    <p className="text-sm text-gray-700">
                      Section 2: Medical History
                    </p>
                    <p className="text-sm text-gray-700">
                      Section 3: Current Medications
                    </p>
                    <p className="text-sm text-gray-700"> Section 4: Adherence
                      Assessment
                    </p>
                    <p className="text-sm text-gray-700">
                      Section 5: Clinical Observations
                    </p>
                  </div>
                  <Button className="w-full" size="default">
                    Download Interview Form
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <span className="text-2xl">HMR Report Form</span>
                </CardTitle>
                <CardDescription>
                  Structured report template for documenting Home Medicine
                  Review findings and recommendations. Includes sections for
                  summary, medication review, and action plan.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>File Type: Document</span>
                    <span>Size: ~2 pages</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700">Section 1: Summary</p>
                    <p className="text-sm text-gray-700">Section 2: Medication Review</p>
                    <p className="text-sm text-gray-700">Section 3: Action Plan</p>
                  </div>
                  <Button className="w-full" size="default">
                    Download Report Form
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-6">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Use HMR Templates?</h2>
                <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                  HMR templates streamline the process of conducting Home Medicine Reviews by providing structured, easy-to-use forms that ensure all relevant information is captured efficiently.
                </p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-brand-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <span className="text-2xl text-white">⚡</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Save Time</h3>
                <p className="text-gray-700">Don't repeat yourself - use templates to capture information quickly and accurately.</p>
            </div>

            <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-brand-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <span className="text-2xl text-white">🎯</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Professional</h3>
                <p className="text-gray-700">Ensure high-quality, consistent documentation with professionally designed templates.</p>
            </div>

            <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-brand-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <span className="text-2xl text-white">☑️</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Comprehensive</h3>
                <p className="text-gray-700">Cover all aspects of the review process with detailed, structured templates.</p>
            </div>
        </div>
      </section>
      {/* CTA Section */}
    </>
  );
};

export default HMRTemplatesPage;
