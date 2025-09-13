import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white shadow-soft border-b border-neutral-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 bg-primary-900 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg font-bold font-title">BC</span>
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-bold text-primary-900 font-title">
                  Buete Consulting
                </h1>
                <p className="text-sm text-neutral-600 font-caption">
                  Healthcare Solutions
                </p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a
                href="#home"
                className="text-neutral-700 hover:text-primary-900 px-3 py-2 text-sm font-medium font-caption transition-colors"
              >
                Home
              </a>
              <a
                href="#templates"
                className="text-neutral-700 hover:text-primary-900 px-3 py-2 text-sm font-medium font-caption transition-colors"
              >
                Website Templates
              </a>
              <a
                href="#tools"
                className="text-neutral-700 hover:text-primary-900 px-3 py-2 text-sm font-medium font-caption transition-colors"
              >
                Pharmacy Tools
              </a>
              <a
                href="#hmr"
                className="text-neutral-700 hover:text-primary-900 px-3 py-2 text-sm font-medium font-caption transition-colors"
              >
                HMR Login
              </a>
              <button className="inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-accent-500 text-white hover:bg-accent-600 focus:ring-accent-400 px-4 py-2 text-base rounded-lg font-caption">
                Contact Us
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <section className="py-20 lg:py-32 gradient-brand text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl lg:text-6xl font-bold font-title mb-6 animate-fade-in">
              Healthcare Solutions<br />
              <span className="text-accent-500">That Work</span>
            </h1>
            <p className="text-xl lg:text-2xl font-body mb-8 max-w-3xl mx-auto opacity-90 animate-slide-up">
              Professional website templates, pharmacy tools, and clinical consulting 
              services designed specifically for healthcare professionals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
              <button className="inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-accent-500 text-white hover:bg-accent-600 focus:ring-accent-400 px-8 py-4 text-xl rounded-xl font-caption">
                Explore Templates
              </button>
              <button className="inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 border border-white text-white hover:bg-white hover:text-primary-900 focus:ring-white px-8 py-4 text-xl rounded-xl font-caption">
                Try Pharmacy Tools
              </button>
            </div>
          </div>
        </section>

        {/* Preview Section */}
        <section className="py-16 lg:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-primary-900 font-title mb-4">
                Built for Healthcare Professionals
              </h2>
              <p className="text-lg text-neutral-700 font-body max-w-2xl mx-auto">
                Our platform combines beautiful design with practical functionality, 
                created specifically for the healthcare industry.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white rounded-xl shadow-soft p-8 text-center">
                <div className="h-16 w-16 bg-accent-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-2xl font-bold font-title">🌐</span>
                </div>
                <h3 className="text-xl font-semibold text-primary-900 font-title mb-4">
                  Website Templates
                </h3>
                <p className="text-neutral-700 font-body">
                  Professional, responsive templates designed for healthcare practices and consultancies.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white rounded-xl shadow-soft p-8 text-center">
                <div className="h-16 w-16 bg-primary-900 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-2xl font-bold font-title">💊</span>
                </div>
                <h3 className="text-xl font-semibold text-primary-900 font-title mb-4">
                  Pharmacy Tools
                </h3>
                <p className="text-neutral-700 font-body">
                  Calculators, dose calendars, and clinical tools to support daily pharmacy practice.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white rounded-xl shadow-soft p-8 text-center">
                <div className="h-16 w-16 bg-accent-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <span className="text-white text-2xl font-bold font-title">📋</span>
                </div>
                <h3 className="text-xl font-semibold text-primary-900 font-title mb-4">
                  Clinical Consulting
                </h3>
                <p className="text-neutral-700 font-body">
                  Home Medicine Review tools and clinical consulting services for healthcare providers.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-primary-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="h-10 w-10 bg-accent-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg font-bold font-title">BC</span>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold font-title">Buete Consulting</h3>
                <p className="text-neutral-300 font-caption">Healthcare Solutions</p>
              </div>
            </div>
            <p className="text-neutral-300 font-body max-w-md mx-auto mb-6">
              Providing comprehensive healthcare consulting services and digital solutions.
            </p>
            <p className="text-neutral-400 text-sm font-caption">
              © 2025 Buete Consulting. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
