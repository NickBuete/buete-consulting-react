/**
 * Template Hero Section
 * Modern hero with search and quick filters
 */

import React, { useState } from 'react';
import { Zap, Search, Layout } from 'lucide-react';
import { HealthcareCategory } from '../../types/template';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface TemplateHeroProps {
  totalTemplates?: number;
  featuredTemplatesCount?: number;
  onSearch?: (query: string) => void;
  onCategoryFilter?: (category: HealthcareCategory | 'all') => void;
  className?: string;
}

const TemplateHero: React.FC<TemplateHeroProps> = ({
  totalTemplates = 0,
  featuredTemplatesCount = 0,
  onSearch,
  onCategoryFilter,
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <section className="relative bg-gradient-to-br from-brand-900 via-brand-700 to-brand-900 text-white overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        {/* Main Content */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in">
            Healthcare Website Templates
            <span className="block text-orange-400 mt-2">Coming Soon</span>
          </h1>
          <p className="text-xl lg:text-2xl text-neutral-100 max-w-3xl mx-auto mb-8 leading-relaxed">
            Ready-to-use, customizable templates designed specifically for healthcare professionals.
            Launch your professional website quickly and affordably.
          </p>

          {/* Statistics */}
          <div className="flex flex-wrap justify-center gap-8 mb-12">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
              <Layout className="w-6 h-6 text-orange-400" />
              <span className="text-neutral-100">
                <strong className="text-white text-xl">{totalTemplates}</strong> Templates
              </span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
              <Zap className="w-6 h-6 text-orange-400" />
              <span className="text-neutral-100">
                <strong className="text-white text-xl">{featuredTemplatesCount}</strong> Featured
              </span>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="max-w-3xl mx-auto">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400 z-10" />
            <Input
              type="text"
              placeholder="Search templates by name, feature, or specialty..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                onSearch?.(e.target.value);
              }}
              className="w-full pl-12 pr-4 py-4 text-lg bg-white border-2 border-white/30 rounded-xl focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition placeholder:text-gray-400"
            />
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => onCategoryFilter?.('all')}
              className="bg-white/10 border-white/30 text-white hover:bg-white hover:text-brand-900 transition-all"
            >
              All Templates
            </Button>
            <Button
              variant="outline"
              onClick={() => onCategoryFilter?.(HealthcareCategory.PHARMACY)}
              className="bg-white/10 border-white/30 text-white hover:bg-white hover:text-brand-900 transition-all"
            >
              Pharmacy
            </Button>
            <Button
              variant="outline"
              onClick={() => onCategoryFilter?.(HealthcareCategory.CLINIC)}
              className="bg-white/10 border-white/30 text-white hover:bg-white hover:text-brand-900 transition-all"
            >
              Medical Clinics
            </Button>
            <Button
              variant="outline"
              onClick={() => onCategoryFilter?.(HealthcareCategory.PHYSIOTHERAPY)}
              className="bg-white/10 border-white/30 text-white hover:bg-white hover:text-brand-900 transition-all"
            >
              Allied Health
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TemplateHero;
