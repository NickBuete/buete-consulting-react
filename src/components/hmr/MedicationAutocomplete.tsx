import React, { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import {
  searchMedications,
  Medication,
} from '../../services/medicationKnowledgeBase'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import { Badge } from '../ui/Badge'
import { cn } from '../../lib/utils'

interface MedicationAutocompleteProps {
  onSelect: (medication: {
    name: string
    genericName?: string
    form?: string
    strength?: string
    route?: string
    indication?: string
  }) => void
  placeholder?: string
  className?: string
  initialValue?: string
}

export const MedicationAutocomplete: React.FC<
  MedicationAutocompleteProps
> = ({ onSelect, placeholder = 'Search medications...', className, initialValue = '' }) => {
  const [query, setQuery] = useState(initialValue)
  const [results, setResults] = useState<Medication[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [showIndicationPicker, setShowIndicationPicker] = useState<Medication | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setShowIndicationPicker(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Search medications with debounce
  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(async () => {
      setIsLoading(true)
      try {
        const medications = await searchMedications(query, 10)
        setResults(medications)
        setIsOpen(medications.length > 0)
      } catch (error) {
        console.error('Error searching medications:', error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }, 300) // 300ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [query])

  const handleSelect = (medication: Medication, indication?: string) => {
    onSelect({
      name: medication.name,
      genericName: medication.genericName || undefined,
      form: medication.form || undefined,
      strength: medication.strength || undefined,
      route: medication.route || undefined,
      indication,
    })

    setQuery('')
    setResults([])
    setIsOpen(false)
    setShowIndicationPicker(null)
  }

  const handleMedicationClick = (medication: Medication) => {
    // If medication has multiple indications, show indication picker
    if (medication.indications.length > 1) {
      setShowIndicationPicker(medication)
    } else if (medication.indications.length === 1) {
      // Auto-select single indication
      handleSelect(medication, medication.indications[0].indication)
    } else {
      // No indication available
      handleSelect(medication)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : results.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleMedicationClick(results[selectedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setShowIndicationPicker(null)
        break
    }
  }

  return (
    <div ref={wrapperRef} className={cn('relative', className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
            onClick={() => {
              setQuery('')
              setResults([])
              setIsOpen(false)
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg p-4 text-center text-sm text-gray-500">
          Searching...
        </div>
      )}

      {/* Results Dropdown */}
      {isOpen && !isLoading && !showIndicationPicker && results.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-auto">
          {results.map((medication, index) => (
            <button
              key={medication.id}
              type="button"
              className={cn(
                'w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0',
                selectedIndex === index && 'bg-gray-50'
              )}
              onClick={() => handleMedicationClick(medication)}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {medication.name}
                    {medication.strength && (
                      <span className="text-gray-600 ml-2">
                        {medication.strength}
                      </span>
                    )}
                  </div>
                  {medication.genericName && (
                    <div className="text-sm text-gray-500">
                      {medication.genericName}
                    </div>
                  )}
                  {medication.form && (
                    <div className="text-xs text-gray-400 mt-1">
                      {medication.form}
                    </div>
                  )}
                  {medication.indications.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {medication.indications.slice(0, 3).map((ind) => (
                        <Badge
                          key={ind.id}
                          variant="secondary"
                          className="text-xs"
                        >
                          {ind.indication}
                        </Badge>
                      ))}
                      {medication.indications.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{medication.indications.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                {medication.usageCount > 0 && (
                  <div className="text-xs text-gray-400 ml-4">
                    Used {medication.usageCount}x
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Indication Picker */}
      {showIndicationPicker && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-auto">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-medium text-gray-900">
              {showIndicationPicker.name}
              {showIndicationPicker.strength && (
                <span className="text-gray-600 ml-2">
                  {showIndicationPicker.strength}
                </span>
              )}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Select an indication:
            </p>
          </div>

          {showIndicationPicker.indications.map((indication) => (
            <button
              key={indication.id}
              type="button"
              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
              onClick={() => handleSelect(showIndicationPicker, indication.indication)}
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-900">{indication.indication}</span>
                {indication.usageCount > 0 && (
                  <span className="text-xs text-gray-400">
                    Used {indication.usageCount}x
                  </span>
                )}
              </div>
            </button>
          ))}

          <button
            type="button"
            className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors text-gray-600 italic"
            onClick={() => handleSelect(showIndicationPicker)}
          >
            No indication / Other
          </button>
        </div>
      )}

      {/* No Results */}
      {isOpen && !isLoading && results.length === 0 && query.length >= 2 && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg p-4 text-center text-sm text-gray-500">
          No medications found. Type to add new.
        </div>
      )}
    </div>
  )
}
