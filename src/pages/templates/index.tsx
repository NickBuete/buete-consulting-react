import React from 'react'
import TemplateHero from '../../components/templates/TemplateHero'
import TemplateFilters from '../../components/templates/TemplateFilters'
import TemplateGrid from '../../components/templates/TemplateGrid'
import { Template } from '../../types/template'
import { useState } from 'react'
import { useTemplateFilters } from '../../hooks/useTemplateFilters'

// Website template viewer
const TemplatesPage: React.FC = () => {
  const [templates] = useState<Template[]>([])
  const isLoading = true

  // Use the custom filter hook
  const { filters, updateFilters, clearFilters, filteredTemplates } =
    useTemplateFilters(templates)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <TemplateHero
        totalTemplates={templates.length}
        featuredTemplatesCount={
          templates.filter((t) => t.status === 'featured').length
        }
        onSearch={(query) => updateFilters({ searchQuery: query })}
        onCategoryFilter={(category) => {
          if (category === 'all') {
            updateFilters({ categories: [] })
          } else {
            updateFilters({ categories: [category] })
          }
        }}
      />

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1">
            <TemplateFilters
              selectedCategories={filters.categories}
              selectedFeatures={filters.features}
              onCategoryChange={(categories) => updateFilters({ categories })}
              onFeatureChange={(features) => updateFilters({ features })}
              onResetFilters={clearFilters}
              showFeatures={true}
              showClearButton={true}
            />
          </div>

          {/* Main Content - Template Grid */}
          <div className="lg:col-span-3">
            <TemplateGrid
              templates={filteredTemplates}
              isLoading={isLoading}
              onPreview={(template) => {
                // Handle template preview
                console.log('Preview template:', template)
              }}
              onDownload={(template) => {
                // Handle template download
                console.log('Download template:', template)
              }}
              emptyStateTitle="No Templates Found"
              emptyStateMessage="Try adjusting your search or filters to find the perfect template."
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default TemplatesPage
