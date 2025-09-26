import React from 'react'
import TemplateCard from './TemplateCard'
import { Template } from '../../types/template'
import { Package } from 'lucide-react'

interface TemplateGridProps {
  // Define any props if needed in the future
  templates: Template[]
  isLoading?: boolean
  className?: string
  columns?: 'auto' | 1 | 2 | 3 | 4
  showFilters?: boolean
  onPreview?: (template: Template) => void
  onDownload?: (template: Template) => void
  emptyStateTitle?: string
  emptyStateMessage?: string
}

const TemplateGrid: React.FC<TemplateGridProps> = ({
  templates,
  isLoading,
  className,
  columns,
  onPreview,
  onDownload,
  emptyStateTitle = 'No Templates Found',
  emptyStateMessage = 'Try adjusting your search or filter settings.',
}) => {
  return (
    // main container
    <div className="container">
      {isLoading ? (
        // Loading State
        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${
            className || ''
          }`}
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden animate-pulse"
            >
              <div className="aspect-video bg-gray-200" />
              <div className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-6 bg-gray-200 rounded mb-3" />
                <div className="h-3 bg-gray-200 rounded mb-4" />
                <div className="flex gap-2 mb-4">
                  <div className="h-6 w-16 bg-gray-200 rounded" />
                  <div className="h-6 w-20 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : templates.length === 0 ? (
        // Empty State
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="font-heading text-xl font-semibold text-gray-900 mb-2">
            {emptyStateTitle}
          </h3>
          <p className="font-body text-gray-600 max-w-md mx-auto">
            {emptyStateMessage}
          </p>
        </div>
      ) : (
        // Grid of templates
        <div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${
            className || ''
          }`}
        >
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onPreview={onPreview}
              onDownload={onDownload}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default TemplateGrid
