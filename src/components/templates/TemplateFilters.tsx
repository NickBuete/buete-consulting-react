import React from 'react'
import { HealthcareCategory, TemplateFeature } from '../../types/template'
import { Filter, X } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'

interface TemplateFiltersProps {
  //filter state
  selectedCategories: HealthcareCategory[]
  selectedFeatures: TemplateFeature[]

  // Callbacks
  onCategoryChange: (categories: HealthcareCategory[]) => void
  onFeatureChange: (features: TemplateFeature[]) => void
  onResetFilters: () => void

  //Display options
  showFeatures?: boolean
  showClearButton?: boolean
  className?: string
}

const TemplateFilters: React.FC<TemplateFiltersProps> = ({
  selectedCategories,
  selectedFeatures,
  onCategoryChange,
  onFeatureChange,
  onResetFilters,
  showFeatures,
  showClearButton,
  className,
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-heading text-lg font-semibold text-gray-900">
            Filters
          </h3>
        </div>
        {/* Active filter count */}
        {(selectedCategories.length > 0 || selectedFeatures.length > 0) && (
          <Badge variant="secondary" className="bg-brand-50 text-brand-600">
            {selectedCategories.length + selectedFeatures.length} active
          </Badge>
        )}
      </div>
      {/* Category Filters */}
      <div className="mb-6">
        <h4 className="font-heading text-sm font-medium text-gray-900 mb-3">
          Categories
        </h4>
        <div className="flex flex-wrap gap-2">
          {/* All Categories Option */}
          <Badge
            variant={selectedCategories.length === 0 ? 'default' : 'outline'}
            className={`cursor-pointer transition-colors ${
              selectedCategories.length === 0
                ? 'bg-brand-600 hover:bg-brand-700 text-white'
                : 'hover:bg-gray-50'
            }`}
            onClick={() => onCategoryChange([])}
          >
            All Categories
          </Badge>

          {/* Individual Category Badges */}
          {Object.values(HealthcareCategory).map((category) => {
            const isSelected = selectedCategories.includes(category)
            return (
              <Badge
                key={category}
                variant={isSelected ? 'default' : 'outline'}
                className={`cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-brand-600 hover:bg-brand-700 text-white'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => {
                  if (isSelected) {
                    onCategoryChange(
                      selectedCategories.filter((c) => c !== category)
                    )
                  } else {
                    onCategoryChange([...selectedCategories, category])
                  }
                }}
              >
                {category.charAt(0).toUpperCase() +
                  category.slice(1).replace('-', ' ')}
              </Badge>
            )
          })}
        </div>
      </div>

      {/* Feature Filters */}
      {showFeatures && (
        <div className="mb-6">
          <h4 className="font-heading text-sm font-medium text-gray-900 mb-3">
            Features
          </h4>
          <div className="flex flex-wrap gap-2">
            {Object.values(TemplateFeature).map((feature) => {
              const isSelected = selectedFeatures.includes(feature)
              return (
                <Badge
                  key={feature}
                  variant={isSelected ? 'default' : 'outline'}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-orange-500 hover:bg-orange-600 text-white'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    if (isSelected) {
                      onFeatureChange(
                        selectedFeatures.filter((f) => f !== feature)
                      )
                    } else {
                      onFeatureChange([...selectedFeatures, feature])
                    }
                  }}
                >
                  {feature
                    .replace('-', ' ')
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </Badge>
              )
            })}
          </div>
        </div>
      )}

      {/* Reset Filters Button */}
      {showClearButton &&
        (selectedCategories.length > 0 || selectedFeatures.length > 0) && (
          <Button
            variant="outline"
            onClick={onResetFilters}
            className="w-full text-gray-600 hover:text-gray-900"
          >
            <X className="w-4 h-4 mr-2" />
            Clear All Filters
          </Button>
        )}
    </div>
  )
}

export default TemplateFilters
