import React from 'react';
import { Header } from './components/layout';
import { Footer } from './components/layout';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <main>
        <section className="py-20 lg:py-32 bg-gradient-to-r from-blue-600 to-orange-500 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              Healthcare Solutions<br />
              <span className="text-orange-300">That Work</span>
            </h1>
            <p className="text-xl lg:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Professional website templates, pharmacy tools, and clinical consulting 
              services designed specifically for healthcare professionals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-orange-500 text-white hover:bg-orange-600 px-8 py-4 text-xl rounded-xl font-medium transition-colors">
                Explore Templates
              </button>
              <button className="border border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 text-xl rounded-xl font-medium transition-colors">
                Try Pharmacy Tools
              </button>
            </div>
          </div>
        </section>

        {/* Preview Section */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-blue-900 mb-4">
                Built for Healthcare Professionals
              </h2>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                Our platform combines beautiful design with practical functionality, 
                created specifically for the healthcare industry.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="h-16 w-16 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-2xl font-bold">🌐</span>
                </div>
                <h3 className="text-xl font-semibold text-blue-900 mb-4">
                  Website Templates
                </h3>
                <p className="text-gray-700">
                  Professional, responsive templates designed for healthcare practices and consultancies.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="h-16 w-16 bg-blue-900 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-2xl font-bold">💊</span>
                </div>
                <h3 className="text-xl font-semibold text-blue-900 mb-4">
                  Pharmacy Tools
                </h3>
                <p className="text-gray-700">
                  Calculators, dose calendars, and clinical tools to support daily pharmacy practice.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="h-16 w-16 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-2xl font-bold">📋</span>
                </div>
                <h3 className="text-xl font-semibold text-blue-900 mb-4">
                  Clinical Consulting
                </h3>
                <p className="text-gray-700">
                  Home Medicine Review tools and clinical consulting services for healthcare providers.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
      
  );
}

export default App;
