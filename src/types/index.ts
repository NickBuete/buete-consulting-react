// Common TypeScript type definitions used across the application

// Base types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'pharmacist' | 'client';
  createdAt: Date;
  updatedAt: Date;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Common component props
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Form types
export interface FormError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  errors: FormError[];
  isSubmitting: boolean;
  isValid: boolean;
}

// Navigation types
export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType;
  children?: NavItem[];
}

// Template types (for website showcase)
export interface Template {
  id: string;
  name: string;
  description: string;
  category: 'business' | 'portfolio' | 'ecommerce' | 'blog';
  previewUrl: string;
  thumbnailUrl: string;
  technologies: string[];
  features: string[];
  price: number;
  isActive: boolean;
}

// Pharmacy tool types
export interface PharmacyCalculation {
  id: string;
  type: 'dosage' | 'conversion' | 'bmi' | 'clearance';
  inputs: Record<string, any>;
  result: any;
  timestamp: Date;
}

// HMR System types
export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  medicareNumber?: string;
  address: Address;
  contactInfo: ContactInfo;
}

export interface Address {
  street: string;
  suburb: string;
  state: string;
  postcode: string;
  country: string;
}

export interface ContactInfo {
  phone?: string;
  mobile?: string;
  email?: string;
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
}

export interface Medication {
  id: string;
  name: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  indication: string;
  prescriber: string;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
}

export interface HMRReferral {
  id: string;
  patientId: string;
  referrerName: string;
  referrerType: 'gp' | 'specialist' | 'pharmacist' | 'self';
  referralDate: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'accepted' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
}