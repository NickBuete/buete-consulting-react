import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../router/routes';

const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center space-y-4">
        <h1 className="text-2xl font-semibold text-gray-900">Access denied</h1>
        <p className="text-sm text-gray-600">
          This area requires a subscription tier that is not linked to your account yet.
        </p>
        <Link
          to={ROUTES.CONTACT}
          className="inline-flex justify-center px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-md transition-colors"
        >
          Contact us to upgrade
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
