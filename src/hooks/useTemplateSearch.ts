import { useState, useMemo } from 'react';
import { Template } from '../types/template';

export const useTemplateSearch = (templates: Template[], searchQuery: string) => {
  const [isSearching, setIsSearching] = useState(false);

  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) {
      return templates;
    }

    setIsSearching(true);
    
    const filtered = templates.filter(template => 
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.meta.industry.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setIsSearching(false);
    return filtered;
  }, [templates, searchQuery]);

  return {
    filteredTemplates,
    isSearching
  };
};
