import { useState, useMemo } from 'react'
import {
  HealthcareCategory,
  TemplateFeature,
  Template,
} from '../types/template'

export interface FilterState {
  categories: HealthcareCategory[]
  features: TemplateFeature[]
  searchQuery: string
}

export const useTemplateFilters = (templates: Template[]) => {
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    features: [],
    searchQuery: '',
  })

  const updateFilters = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const clearFilters = () => {
    setFilters({
      categories: [],
      features: [],
      searchQuery: '',
    })
  }

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      // Category filter
      if (
        filters.categories.length > 0 &&
        !filters.categories.includes(template.category)
      ) {
        return false
      }
      // Feature filter
      if (
        filters.features.length > 0 &&
        !filters.features.every((f) => template.features.includes(f))
      ) {
        return false
      }
      // Search filter
      if (
        filters.searchQuery &&
        !template.title
          .toLowerCase()
          .includes(filters.searchQuery.toLowerCase()) &&
        !template.description
          .toLowerCase()
          .includes(filters.searchQuery.toLowerCase())
      ) {
        return false
      }
      return true
    })
  }, [templates, filters])

  return {
    filters,
    updateFilters,
    clearFilters,
    filteredTemplates,
  }
}
