// Healthcare categories for templates
import { HealthcareCategory } from '../types/template';

export const healthcareCategories = [
  {
    id: HealthcareCategory.PHARMACY,
    label: 'Pharmacy',
    description: 'Community and hospital pharmacy templates'
  },
  {
    id: HealthcareCategory.CLINIC,
    label: 'Medical Clinic',
    description: 'General practice and specialist clinic templates'
  },
  {
    id: HealthcareCategory.DENTAL,
    label: 'Dental Practice',
    description: 'Dental clinic and orthodontist templates'
  },
  {
    id: HealthcareCategory.PHYSIOTHERAPY,
    label: 'Physiotherapy',
    description: 'Physical therapy and rehabilitation templates'
  },
  {
    id: HealthcareCategory.MENTAL_HEALTH,
    label: 'Mental Health',
    description: 'Psychology and counseling practice templates'
  },
  {
    id: HealthcareCategory.SPECIALIST,
    label: 'Specialist',
    description: 'Specialist medical practice templates'
  }
];
