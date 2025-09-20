import { useState } from 'react';
import { HealthcareCategory, TemplateFeature } from '../types/template';

export interface FilterState {
  categories: HealthcareCategory[];
  features: TemplateFeature[];
  searchQuery: string;
}

export const useTemplateFilters = () => {
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    features: [],
    searchQuery: ''
  });

  const updateFilters = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      features: [],
      searchQuery: ''
    });
  };

  return {
    filters,
    updateFilters,
    clearFilters
  };
};
