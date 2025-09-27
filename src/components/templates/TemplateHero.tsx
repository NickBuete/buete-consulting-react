import React from 'react'
import { Zap } from 'lucide-react'
import { Filter, Search } from 'lucide-react'
import { HealthcareCategory } from '../../types/template'
import { useState } from 'react'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

interface TemplateHeroProps {
  totalTemplates?: number
  featuredTemplatesCount?: number
  onSearch?: (query: string) => void
  onCategoryFilter?: (category: HealthcareCategory | 'all') => void
  className?: string
}

const TemplateHero: React.FC<TemplateHeroProps> = ({
  totalTemplates = 0,
  featuredTemplatesCount = 0,
  onSearch,
  onCategoryFilter,
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  return (
    <section className="relative py-20 px-6 bg-gradient-to-r from-brand-600 to-orange-500 text-white">
      <div className="max-w-7xl mx-auto">
        {/* Main content */}
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Professional Healthcare
            <span className="block text-orange-200">Website Templates</span>
          </h1>
          <p className="font-body text-xl md:text-2xl text-orange-100 max-w-3xl mx-auto mb-8">
            Ready-to-use, customisable templates designed specifically for
            healthcare. Launch your site quickly and easily.
          </p>
          {/* Statistics */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-sm md:text-base">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-200" />
              <span className="text-orange-100">
                <strong className="text-white">{totalTemplates}</strong>{' '}
                Templates
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-orange-200" />
              <span className="text-orange-100">
                <strong className="text-white">{featuredTemplatesCount}</strong>{' '}
                Featured
              </span>
            </div>
          </div>
        </div>
        {/* Search section */}
        <div className="flex flex-col items-center gap-6">
          <div className="relative w-full max-w-3xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-300 z-10" />
            <Input
              type="text"
              placeholderClassName="placeholder-white placeholder-opacity-100"
              placeholder="Search templates by name, feature or specialty."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                onSearch?.(e.target.value)
              }}
              className="w-full pl-12 pr-4 py-4 text-lg bg-white/10 backdrop-blur-sm border border-white/30 text-white rounded-xl focus:bg-white/20 focus:border-white/50 transition"
            />
          </div>
          {/* Quick filters */}
          <div className="flex flex-wrap justify-center gap-4 mt-2">
            <Button
              variant="outline"
              onClick={() => onCategoryFilter?.('all')}
              className="bg-white/10 border-white/30 text-white font-semibold px-6 py-3 rounded-xl shadow-sm hover:bg-white/20 hover:border-white/50 transition"
            >
              All Templates
            </Button>
            <Button
              variant="outline"
              onClick={() => onCategoryFilter?.(HealthcareCategory.PHARMACY)}
              className="bg-white/10 border-white/30 text-white font-semibold px-6 py-3 rounded-xl shadow-sm hover:bg-white/20 hover:border-white/50 transition"
            >
              Pharmacy Templates
            </Button>
          </div>
        </div>
        {/* Statistics */}
      </div>
    </section>
  )
}

export default TemplateHero
