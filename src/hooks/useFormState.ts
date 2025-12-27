/**
 * Generic form state management hook
 * Consolidates loading, error, and submission states used across 5+ components
 * Based on pattern from useCrudResource.ts
 */

import { useState } from 'react';

export interface FormState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  submitting: boolean;
}

export interface UseFormStateReturn<T> {
  formState: FormState<T>;
  setData: (data: T | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSubmitting: (submitting: boolean) => void;
  reset: () => void;
}

/**
 * Hook for managing form state (loading, error, data, submitting)
 * @param initialData - Optional initial data value
 * @returns Form state and state setters
 */
export function useFormState<T = unknown>(initialData: T | null = null): UseFormStateReturn<T> {
  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setData(initialData);
    setLoading(false);
    setError(null);
    setSubmitting(false);
  };

  return {
    formState: {
      data,
      loading,
      error,
      submitting,
    },
    setData,
    setLoading,
    setError,
    setSubmitting,
    reset,
  };
}
