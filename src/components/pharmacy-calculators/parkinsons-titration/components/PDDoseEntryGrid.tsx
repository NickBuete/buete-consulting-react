import React, { useCallback, useMemo } from 'react';
import { Minus, Plus, AlertTriangle, Lock, TrendingUp } from 'lucide-react';
import {
  type PDSlotDose,
  type PDTimeSlot,
  type PDPreparation,
  type SlotTitrationMode,
  formatPreparationStrength,
} from '../../../../types/parkinsonsMedications';

interface PDDoseEntryGridProps {
  timeSlots: PDTimeSlot[];
  doses: PDSlotDose[];
  onDosesChange: (doses: PDSlotDose[]) => void;
  preparation: PDPreparation;
  allowHalves?: boolean;
  maxPerDose?: number;
  disabled?: boolean;
  showTotals?: boolean;
  /** Show titration mode controls (for titrating medications) */
  showTitrationControls?: boolean;
}

export const PDDoseEntryGrid: React.FC<PDDoseEntryGridProps> = ({
  timeSlots,
  doses,
  onDosesChange,
  preparation,
  allowHalves = true,
  maxPerDose = 3,
  disabled = false,
  showTotals = true,
  showTitrationControls = false,
}) => {
  // Ensure we have a dose entry for each time slot with proper defaults
  const normalizedDoses = useMemo(() => {
    return timeSlots.map((slot, index) => {
      const existing = doses.find(d => d.slotId === slot.id);
      return existing || {
        slotId: slot.id,
        tabletCount: 0,
        titrationMode: 'titrate' as SlotTitrationMode,
        titrationOrder: index + 1,
      };
    });
  }, [timeSlots, doses]);

  const handleDoseChange = useCallback(
    (slotId: string, newCount: number) => {
      // Clamp value
      const clamped = Math.max(0, Math.min(newCount, maxPerDose));

      // Round to nearest allowed increment
      const rounded = allowHalves ? Math.round(clamped * 2) / 2 : Math.round(clamped);

      const updated = normalizedDoses.map(d =>
        d.slotId === slotId ? { ...d, tabletCount: rounded } : d
      );
      onDosesChange(updated);
    },
    [normalizedDoses, onDosesChange, allowHalves, maxPerDose]
  );

  const handleTitrationModeChange = useCallback(
    (slotId: string, mode: SlotTitrationMode) => {
      // When switching to titrate, assign order 1 (user can change it)
      // When switching to hold-steady, clear order and min/max
      const updated = normalizedDoses.map(d => {
        if (d.slotId !== slotId) return d;
        return {
          ...d,
          titrationMode: mode,
          titrationOrder: mode === 'titrate' ? 1 : undefined,
          minTablets: mode === 'titrate' ? d.minTablets : undefined,
          maxTablets: mode === 'titrate' ? d.maxTablets : undefined,
        };
      });
      onDosesChange(updated);
    },
    [normalizedDoses, onDosesChange]
  );

  // Allow direct order input - multiple slots can share same order number
  const handleTitrationOrderChange = useCallback(
    (slotId: string, newOrder: number) => {
      const updated = normalizedDoses.map(d =>
        d.slotId === slotId ? { ...d, titrationOrder: newOrder } : d
      );
      onDosesChange(updated);
    },
    [normalizedDoses, onDosesChange]
  );

  // Handle min/max changes for per-slot floor/ceiling
  const handleMinMaxChange = useCallback(
    (slotId: string, field: 'minTablets' | 'maxTablets', value: number | undefined) => {
      const updated = normalizedDoses.map(d =>
        d.slotId === slotId ? { ...d, [field]: value } : d
      );
      onDosesChange(updated);
    },
    [normalizedDoses, onDosesChange]
  );

  const increment = allowHalves ? 0.5 : 1;

  // Count titrating slots and get max order for display
  const titratingSlots = normalizedDoses.filter(d => d.titrationMode === 'titrate');
  const titratingSlotCount = titratingSlots.length;
  const maxTitrationOrder = titratingSlots.length > 0
    ? Math.max(...titratingSlots.map(d => d.titrationOrder || 1))
    : 1;

  // Calculate totals
  const totalTablets = normalizedDoses.reduce((sum, d) => sum + d.tabletCount, 0);
  const totalDose = totalTablets * preparation.strength;

  // Check for warnings
  const hasHalfTablets = normalizedDoses.some(d => d.tabletCount % 1 !== 0);
  const cannotHalveWarning = hasHalfTablets && !preparation.canBeHalved;

  return (
    <div className={`space-y-4 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Grid */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {/* Header */}
        <div className={`grid gap-0 bg-gray-100 border-b border-gray-200 ${showTitrationControls ? 'grid-cols-5' : 'grid-cols-3'}`}>
          <div className="px-4 py-2 font-medium text-gray-700">Time</div>
          <div className="px-4 py-2 font-medium text-gray-700 text-center">Start</div>
          <div className="px-4 py-2 font-medium text-gray-700 text-right">Dose</div>
          {showTitrationControls && (
            <>
              <div className="px-4 py-2 font-medium text-gray-700 text-center">Titration</div>
              <div className="px-4 py-2 font-medium text-gray-700 text-center">Min/Max</div>
            </>
          )}
        </div>

        {/* Rows */}
        {timeSlots.map((slot, index) => {
          const doseEntry = normalizedDoses.find(d => d.slotId === slot.id);
          const tabletCount = doseEntry?.tabletCount || 0;
          const slotDose = tabletCount * preparation.strength;
          const isAtMax = tabletCount >= maxPerDose;
          const isAtMin = tabletCount <= 0;
          const titrationMode = doseEntry?.titrationMode || 'titrate';
          const titrationOrder = doseEntry?.titrationOrder || 1;
          const isHoldSteady = titrationMode === 'hold-steady';
          const minTablets = doseEntry?.minTablets;
          const maxTablets = doseEntry?.maxTablets;

          return (
            <div
              key={slot.id}
              className={`grid gap-0 items-center border-b border-gray-100 last:border-b-0 ${
                showTitrationControls ? 'grid-cols-5' : 'grid-cols-3'
              } ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${
                showTitrationControls && isHoldSteady ? 'bg-amber-50/50' : ''
              }`}
            >
              {/* Time label */}
              <div className="px-4 py-3">
                <span className="font-medium text-gray-900">{slot.label}</span>
                {slot.defaultTime && (
                  <span className="text-gray-500 text-sm ml-2">({slot.defaultTime})</span>
                )}
              </div>

              {/* Tablet count controls */}
              <div className="px-4 py-3 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDoseChange(slot.id, tabletCount - increment)}
                  disabled={disabled || isAtMin}
                  className="p-1.5 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus className="h-4 w-4" />
                </button>

                <input
                  type="number"
                  value={tabletCount}
                  onChange={e => handleDoseChange(slot.id, parseFloat(e.target.value) || 0)}
                  disabled={disabled}
                  step={increment}
                  min={0}
                  max={maxPerDose}
                  className="w-16 text-center px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 font-medium"
                />

                <button
                  type="button"
                  onClick={() => handleDoseChange(slot.id, tabletCount + increment)}
                  disabled={disabled || isAtMax}
                  className="p-1.5 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Dose display */}
              <div className="px-4 py-3 text-right">
                <span className={`font-medium ${slotDose > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
                  {slotDose > 0 ? `${slotDose}${preparation.unit}` : '-'}
                </span>
              </div>

              {/* Titration control */}
              {showTitrationControls && (
                <div className="px-4 py-3 flex items-center justify-center gap-2">
                  {isHoldSteady ? (
                    <button
                      type="button"
                      onClick={() => handleTitrationModeChange(slot.id, 'titrate')}
                      disabled={disabled}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-100 text-amber-700 border border-amber-300 hover:bg-amber-200 transition-colors text-sm font-medium"
                      title="Click to enable titration for this dose"
                    >
                      <Lock className="h-3.5 w-3.5" />
                      Hold
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleTitrationModeChange(slot.id, 'hold-steady')}
                        disabled={disabled}
                        className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-green-100 text-green-700 border border-green-300 hover:bg-green-200 transition-colors text-xs font-medium"
                        title="Click to hold this dose steady"
                      >
                        <TrendingUp className="h-3 w-3" />
                      </button>
                      {/* Order selector - allows same order for multiple slots */}
                      <div className="flex items-center gap-0.5" title="Titration order (slots with same # change together)">
                        <span className="text-xs text-gray-500">#</span>
                        <input
                          type="number"
                          value={titrationOrder}
                          onChange={e => handleTitrationOrderChange(slot.id, parseInt(e.target.value) || 1)}
                          disabled={disabled}
                          min={1}
                          max={Math.max(maxTitrationOrder + 1, titratingSlotCount)}
                          className="w-10 text-center text-sm border border-gray-300 rounded px-1 py-0.5 focus:ring-1 focus:ring-brand-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Min/Max controls */}
              {showTitrationControls && (
                <div className="px-2 py-3 flex items-center justify-center gap-1">
                  {isHoldSteady ? (
                    <span className="text-xs text-gray-400">-</span>
                  ) : (
                    <div className="flex items-center gap-1 text-xs">
                      <div className="flex flex-col items-center">
                        <span className="text-gray-400 text-[10px]">min</span>
                        <input
                          type="number"
                          value={minTablets ?? ''}
                          onChange={e => handleMinMaxChange(slot.id, 'minTablets', e.target.value ? parseFloat(e.target.value) : undefined)}
                          disabled={disabled}
                          placeholder="0"
                          min={0}
                          max={maxPerDose}
                          step={increment}
                          className="w-10 text-center border border-gray-300 rounded px-1 py-0.5 focus:ring-1 focus:ring-brand-500"
                        />
                      </div>
                      <span className="text-gray-300">-</span>
                      <div className="flex flex-col items-center">
                        <span className="text-gray-400 text-[10px]">max</span>
                        <input
                          type="number"
                          value={maxTablets ?? ''}
                          onChange={e => handleMinMaxChange(slot.id, 'maxTablets', e.target.value ? parseFloat(e.target.value) : undefined)}
                          disabled={disabled}
                          placeholder={String(maxPerDose)}
                          min={0}
                          max={maxPerDose}
                          step={increment}
                          className="w-10 text-center border border-gray-300 rounded px-1 py-0.5 focus:ring-1 focus:ring-brand-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Totals row */}
        {showTotals && (
          <div className={`grid gap-0 bg-brand-50 border-t-2 border-brand-200 ${showTitrationControls ? 'grid-cols-5' : 'grid-cols-3'}`}>
            <div className="px-4 py-3 font-bold text-brand-900">TOTAL</div>
            <div className="px-4 py-3 text-center font-bold text-brand-900">
              {totalTablets} {totalTablets === 1 ? 'tablet' : 'tablets'}
            </div>
            <div className="px-4 py-3 text-right font-bold text-brand-900">
              {totalDose}{preparation.unit}
            </div>
            {showTitrationControls && (
              <>
                <div className="px-4 py-3 text-center text-sm text-gray-600">
                  {titratingSlotCount} titrating
                </div>
                <div className="px-4 py-3 text-center text-sm text-gray-500">
                  {/* Summary of orders */}
                  {maxTitrationOrder > 1 ? `${maxTitrationOrder} steps` : ''}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Warning for halving non-halvable preparation */}
      {cannotHalveWarning && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-800">
            <p className="font-medium">Half tablets not possible</p>
            <p className="text-red-700">
              {preparation.brandName} {formatPreparationStrength(preparation)} cannot be halved.
              {preparation.notes && ` (${preparation.notes})`}
            </p>
          </div>
        </div>
      )}

      {/* Preparation info */}
      <div className="text-sm text-gray-500">
        <p>
          Using <span className="font-medium">{preparation.brandName} {formatPreparationStrength(preparation)}</span>
          {preparation.canBeHalved ? ' (can be halved)' : ' (cannot be halved)'}
        </p>
        {!allowHalves && <p className="text-amber-600">Whole tablets only mode enabled</p>}
      </div>
    </div>
  );
};

export default PDDoseEntryGrid;
