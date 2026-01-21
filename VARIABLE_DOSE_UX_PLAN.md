# Variable Dose UX/UI Improvement Plan

## Implementation Status

### Completed (Phase 1a)
- [x] **Wizard-style modal with steps** - `MedicationFormWizard.tsx`
- [x] **Visual schedule type selector cards** - `ScheduleTypeSelector.tsx`
- [x] **WizardStepper component** - `src/components/ui/WizardStepper.tsx`
- [x] **Larger calendar tiles** - Increased from 100px to 140px/160px
- [x] **Expandable day detail panel** - `DayDetailDialog` component
- [x] **View mode toggle (compact/detailed)** - Toggle buttons in calendar header
- [x] **Improved navigation controls** - Month/year dropdowns, jump to start/end buttons
- [x] **Today indicator** - Ring highlight on current date

### Remaining (Phase 2+)
- [ ] Inline calendar editing
- [ ] Drag interactions
- [ ] Advanced export options
- [ ] Keyboard navigation (arrow keys)

---

## Executive Summary

The variable dose modal and calendar view have been significantly improved:

### What Changed

**Modal (MedicationFormWizard.tsx):**
1. **Step-based wizard flow** with 4 steps: Basics → Schedule → Tablets → Review
2. **Visual schedule type cards** instead of dropdown
3. **Progressive disclosure** - Only show relevant fields for each step
4. **Review step** with edit links back to each section
5. **Better visual hierarchy** with larger touch targets

**Calendar (DoseCalendarView.tsx):**
1. **Larger tiles** - `min-h-[140px] md:min-h-[160px]` in detailed mode
2. **View mode toggle** - Compact vs Detailed views
3. **Day detail dialog** - Click any day to see full medication breakdown
4. **Improved navigation** - Month/year dropdowns, jump to start/end
5. **Today indicator** - Ring highlight on current date
6. **Better typography** - Larger fonts, better spacing

---

## Architecture

### New Files Created
```
src/components/ui/WizardStepper.tsx         # Reusable step indicator
src/components/dose-calculator/MedicationFormDialog/
  ├── MedicationFormWizard.tsx              # New wizard-based dialog
  └── ScheduleTypeSelector.tsx              # Visual card selector
```

### Modified Files
```
src/components/dose-calculator/MedicationFormDialog.tsx  # Re-exports wizard
src/components/dose-calculator/DoseCalendarView.tsx      # Enhanced calendar
src/components/ui/index.ts                               # Export WizardStepper
```

---

## Wizard Steps

### Step 1: Basics
- Medication name
- Unit selection (mg, mcg, mL, units)
- Start/End dates
- Schedule type selection (visual cards)

### Step 2: Schedule
- Dynamic fields based on schedule type
- Only shows relevant configuration options
- Uses existing section components (LinearSection, CyclicSection, etc.)

### Step 3: Tablets (Optional)
- Preparation tracking mode selection
- Specify available preparations OR
- Auto-optimize for compounding
- Clear explanation of what this feature does

### Step 4: Review
- Summary of all settings
- Edit links back to each step
- Final save button

---

## Calendar Improvements

### View Modes
- **Compact** (`min-h-[100px]`): Shows total dose only, good for overview
- **Detailed** (`min-h-[140px]`+): Shows all dose times, tablet breakdowns

### Navigation
- Month dropdown for quick selection
- Year dropdown for multi-year schedules
- Previous/Next buttons
- Jump to Start/End buttons (when date range available)

### Day Detail Dialog
- Click any day with medications to open detail view
- Shows full medication breakdown
- Displays all dose times with individual amounts
- Shows tablet breakdown if preparations configured

### Visual Improvements
- Rounded tiles (`rounded-xl`)
- Better hover states with shadow
- Today highlighted with brand ring
- Improved spacing and padding

---

## Future Enhancements (Phase 2+)

### Inline Editing
- Click dose in calendar to quick-edit
- Drag to extend/shorten schedule
- Context menu for common actions

### Keyboard Navigation
- Arrow keys to navigate days
- Enter to open detail
- Escape to close

### Export Options
- Copy schedule to clipboard
- Export to PDF
- Share individual medication

---

## Success Metrics

1. **Time to complete medication entry** - Target: 30% reduction
2. **User errors requiring correction** - Target: 50% reduction
3. **Calendar readability** - User testing for comprehension
4. **Mobile usability** - Touch target compliance (44px min)

---

## Testing Checklist

- [ ] Create new medication via wizard
- [ ] Edit existing medication
- [ ] Switch between schedule types
- [ ] Configure tablet preparations
- [ ] Review step shows correct summary
- [ ] Calendar compact view works
- [ ] Calendar detailed view works
- [ ] Day detail dialog opens/closes
- [ ] Navigation controls work
- [ ] Today indicator visible
- [ ] Mobile responsive layout
