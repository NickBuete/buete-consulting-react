import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <header className="text-center">
        <div className="mx-auto h-20 w-20 bg-blue-600 rounded-full flex items-center justify-center mb-4">
          <span className="text-white text-2xl font-bold">BC</span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mt-4">
          Buete Consulting
        </h1>
        <p className="text-lg text-gray-600 mt-2">
          React + TypeScript + Tailwind CSS v4 ✨
        </p>
        <a
          className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Get Started
        </a>
      </header>
    </div>
  );
}

export default App;
