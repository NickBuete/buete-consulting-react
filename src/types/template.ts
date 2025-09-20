// Template TypeScript interfaces and types

export interface Template {
  id: string;
  title: string;
  description: string;
  category: HealthcareCategory;
  features: TemplateFeature[];
  technologies: string[];
  images: {
    thumbnail: string;
    desktop: string;
    mobile: string;
    tablet?: string;
  };
  demoUrl?: string;
  status: 'available' | 'coming-soon' | 'featured';
  pricing: {
    type: 'free' | 'premium' | 'custom';
    price?: number;
  };
  meta: {
    industry: string;
    complexity: 'simple' | 'moderate' | 'advanced';
    lastUpdated: string;
  };
}

export enum HealthcareCategory {
  PHARMACY = 'pharmacy',
  CLINIC = 'clinic', 
  DENTAL = 'dental',
  PHYSIOTHERAPY = 'physiotherapy',
  MENTAL_HEALTH = 'mental-health',
  SPECIALIST = 'specialist'
}

export enum TemplateFeature {
  ONLINE_BOOKING = 'online-booking',
  PATIENT_PORTAL = 'patient-portal',
  ECOMMERCE = 'ecommerce',
  BLOG = 'blog',
  CONTACT_FORMS = 'contact-forms',
  TELEHEALTH = 'telehealth',
  APPOINTMENT_MANAGEMENT = 'appointment-management',
  PAYMENT_INTEGRATION = 'payment-integration'
}
