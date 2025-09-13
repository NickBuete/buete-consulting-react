// Common utility functions used across the application
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility for combining class names with Tailwind CSS
 */
export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs));
};

/**
 * Format currency values
 */
export const formatCurrency = (amount: number, currency = 'AUD'): string => {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Format dates consistently
 */
export const formatDate = (date: Date | string, format: 'short' | 'long' | 'relative' = 'short'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  switch (format) {
    case 'long':
      return dateObj.toLocaleDateString('en-AU', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    case 'relative':
      return new Intl.RelativeTimeFormat('en-AU').format(
        Math.floor((dateObj.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        'day'
      );
    default:
      return dateObj.toLocaleDateString('en-AU');
  }
};

/**
 * Debounce function for search inputs
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Generate unique IDs
 */
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Validate email addresses
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate Australian phone numbers
 */
export const isValidAustralianPhone = (phone: string): boolean => {
  const cleanedPhone = phone.replace(/[\s\-()]/g, '');
  const phoneRegex = /^(\+?61|0)[2-9]\d{8}$/;
  return phoneRegex.test(cleanedPhone);
};

/**
 * Validate Medicare numbers
 */
export const isValidMedicareNumber = (medicare: string): boolean => {
  const cleanedMedicare = medicare.replace(/\s/g, '');
  return /^\d{10}$/.test(cleanedMedicare);
};

/**
 * Convert string to slug (URL-friendly)
 */
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Capitalize first letter of each word
 */
export const capitalizeWords = (text: string): string => {
  return text.replace(/\b\w/g, (char) => char.toUpperCase());
};

/**
 * Check if user has specific role
 */
export const hasRole = (userRole: string, requiredRoles: string[]): boolean => {
  return requiredRoles.includes(userRole);
};

/**
 * Local storage helpers with error handling
 */
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      console.warn(`Failed to save ${key} to localStorage`);
    }
  },
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch {
      console.warn(`Failed to remove ${key} from localStorage`);
    }
  },
};