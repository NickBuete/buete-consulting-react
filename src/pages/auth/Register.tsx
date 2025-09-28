import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../router/routes';
import type { UserRole } from '../../types/auth';

const roleOptions: { label: string; value: UserRole; description: string }[] = [
  {
    label: 'Standard access',
    value: 'BASIC',
    description: 'Browse public templates and resources.',
  },
  {
    label: 'HMR access',
    value: 'PRO',
    description: 'Unlock HMR workflows and patient management tools.',
  },
];

const RegisterPage: React.FC = () => {
  const { register: registerUser, loading } = useAuth();
  const navigate = useNavigate();
  const [formState, setFormState] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: roleOptions[0].value as UserRole,
  });
  const [error, setError] = useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    setError(null);

    if (formState.password !== formState.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await registerUser({
        username: formState.username,
        email: formState.email,
        password: formState.password,
        role: formState.role,
      });
      navigate(ROUTES.HMR_DASHBOARD, { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to create account';
      setError(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-lg w-full bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Create your account</h1>
        <p className="text-sm text-gray-600 mb-6">
          Already registered?{' '}
          <Link to={ROUTES.LOGIN} className="text-brand-600 hover:underline">
            Sign in
          </Link>
        </p>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Full name
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={formState.username}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:ring-brand-500"
              placeholder="Jane Pharmacist"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formState.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:ring-brand-500"
              placeholder="you@example.com"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formState.password}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:ring-brand-500"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formState.confirmPassword}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-500 focus:ring-brand-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-gray-700">Account type</legend>
            {roleOptions.map((option) => (
              <label
                key={option.value}
                className="flex items-start gap-3 rounded-md border border-gray-200 px-4 py-3 hover:border-brand-300"
              >
                <input
                  type="radio"
                  name="role"
                  value={option.value}
                  checked={formState.role === option.value}
                  onChange={handleChange}
                  className="mt-1"
                  required
                />
                <span>
                  <span className="block text-sm font-medium text-gray-900">{option.label}</span>
                  <span className="block text-xs text-gray-600">{option.description}</span>
                </span>
              </label>
            ))}
          </fieldset>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            className="w-full py-2 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-md transition-colors disabled:opacity-70"
            disabled={loading}
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
