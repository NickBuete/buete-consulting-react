// Sample template data
import { Template, HealthcareCategory, TemplateFeature } from '../types/template';

export const sampleTemplates: Template[] = [
  {
    id: 'pharmacy-pro',
    title: 'Pharmacy Pro',
    description: 'Modern pharmacy website with online ordering and prescription management',
    category: HealthcareCategory.PHARMACY,
    features: [TemplateFeature.ECOMMERCE, TemplateFeature.ONLINE_BOOKING, TemplateFeature.CONTACT_FORMS],
    technologies: ['React', 'TypeScript', 'Tailwind CSS'],
    images: {
      thumbnail: '/templates/pharmacy-pro/thumb.jpg',
      desktop: '/templates/pharmacy-pro/desktop.jpg',
      mobile: '/templates/pharmacy-pro/mobile.jpg'
    },
    status: 'available',
    pricing: {
      type: 'premium',
      price: 299
    },
    meta: {
      industry: 'Pharmacy',
      complexity: 'moderate',
      lastUpdated: '2025-09-20'
    }
  }
  // More templates will be added here
];
