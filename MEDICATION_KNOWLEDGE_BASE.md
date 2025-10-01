# Medication Knowledge Base - Implementation Guide

## Overview

The **Medication Knowledge Base** is an intelligent auto-learning system that stores medication information and learns from user input. When pharmacists add medications to HMR reviews, the system automatically saves:

- Medication name
- Strength (e.g., "5mg", "500mg")
- Form (e.g., "tablet", "capsule", "liquid")
- Generic name
- Route of administration
- **Multiple indications per medication**
- Usage frequency (for ranking/popularity)

### Key Features

✅ **Auto-learning** - Automatically saves medication data as you use it  
✅ **Autocomplete search** - Fast medication lookup by name or indication  
✅ **Multiple indications** - Same medication can have many indications  
✅ **Popularity tracking** - Most-used medications appear first  
✅ **Fuzzy search** - Finds medications even with partial spelling  
✅ **Indication picker** - Select from known indications when adding  

---

## Database Schema

### Tables Created

#### 1. **medications** (Enhanced)

```prisma
model Medication {
  id          Int      @id @default(autoincrement())
  name        String   @db.VarChar(255)
  genericName String?  @map("generic_name")
  form        String?  @db.VarChar(100)  // "tablet", "capsule", etc.
  strength    String?  @db.VarChar(100)  // "5mg", "10mg", etc.
  route       String?  @db.VarChar(100)  // "oral", "IV", etc.
  notes       String?
  isActive    Boolean  @default(true)
  usageCount  Int      @default(0)      // Tracks popularity
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  indications MedicationIndication[]
  
  @@unique([name, strength, form]) // Prevent duplicates
}
```

**Key Changes**:
- Added `genericName` field
- Added `isActive` for soft deletes
- Added `usageCount` to track popularity
- Changed unique constraint to combination of `name + strength + form`

#### 2. **medication_indications** (New Table)

```prisma
model MedicationIndication {
  id           Int        @id @default(autoincrement())
  medicationId Int        @map("medication_id")
  indication   String     @db.VarChar(255)
  usageCount   Int        @default(0)  // Track indication popularity
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  medication   Medication @relation(...)
  
  @@unique([medicationId, indication]) // Prevent duplicate indications
}
```

**Purpose**: Store multiple indications per medication

---

## Backend Implementation

### Service Layer

**File**: `server/src/services/medicationKnowledgeBaseService.ts`

#### Key Functions

1. **`searchMedications(query, limit)`**
   - Searches by medication name, generic name, or indication
   - Case-insensitive fuzzy search
   - Returns medications sorted by popularity
   - Includes all indications per medication

2. **`upsertMedicationKnowledgeBase(input)`**
   - Creates new medication or updates existing
   - Increments `usageCount` on each use
   - Auto-adds new indications
   - Smart duplicate detection

3. **`getPopularMedications(limit)`**
   - Returns most-used medications
   - Sorted by `usageCount` descending
   - Useful for "quick add" buttons

4. **`searchIndications(query, limit)`**
   - Search indications only
   - For indication autocomplete

5. **`getMedicationById(id)`**
   - Get single medication with all indications

### API Routes

**File**: `server/src/routes/medicationRoutes.ts` (enhanced)

#### New Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/medications/search?q={query}&limit={n}` | Search medications |
| GET | `/api/medications/popular?limit={n}` | Get popular medications |
| GET | `/api/medications/indications/search?q={query}` | Search indications |
| POST | `/api/medications/knowledge-base` | Add to knowledge base |
| GET | `/api/medications/:id` | Get medication by ID |

#### Example Requests

**Search Medications**:
```bash
GET /api/medications/search?q=metformin&limit=10
```

**Response**:
```json
{
  "results": [
    {
      "id": 1,
      "name": "Metformin",
      "genericName": "Metformin hydrochloride",
      "form": "tablet",
      "strength": "500mg",
      "route": "oral",
      "usageCount": 45,
      "indications": [
        {
          "id": 1,
          "indication": "Type 2 Diabetes",
          "usageCount": 40
        },
        {
          "id": 2,
          "indication": "PCOS",
          "usageCount": 5
        }
      ]
    }
  ],
  "count": 1
}
```

**Add to Knowledge Base**:
```bash
POST /api/medications/knowledge-base
Content-Type: application/json

{
  "name": "Metformin",
  "strength": "500mg",
  "form": "tablet",
  "indication": "Type 2 Diabetes"
}
```

---

## Frontend Implementation

### Service Layer

**File**: `src/services/medicationKnowledgeBase.ts`

#### Functions

```typescript
// Search medications
const results = await searchMedications('metformin', 10)

// Get popular medications
const popular = await getPopularMedications(50)

// Search indications
const indications = await searchIndications('diabetes', 20)

// Add to knowledge base (auto-called)
await addToKnowledgeBase({
  name: 'Metformin',
  strength: '500mg',
  form: 'tablet',
  indication: 'Type 2 Diabetes'
})
```

### UI Component

**File**: `src/components/hmr/MedicationAutocomplete.tsx`

#### Features

1. **Debounced Search** - 300ms delay, no excessive API calls
2. **Keyboard Navigation** - Arrow keys, Enter, Escape
3. **Multi-Indication Picker** - Shows modal when medication has multiple indications
4. **Click Outside to Close** - UX improvement
5. **Loading States** - Visual feedback during search
6. **No Results** - Helpful message when no matches

#### Usage Example

```tsx
import { MedicationAutocomplete } from './MedicationAutocomplete'

function MyComponent() {
  const handleSelect = (medication) => {
    console.log('Selected:', medication)
    // {
    //   name: 'Metformin',
    //   strength: '500mg',
    //   form: 'tablet',
    //   indication: 'Type 2 Diabetes'
    // }
  }

  return (
    <MedicationAutocomplete
      onSelect={handleSelect}
      placeholder="Search medications..."
      className="w-full"
    />
  )
}
```

---

## Integration Workflow

### How It Works

1. **User Adds Medication**
   - Types in MedicationAutocomplete component
   - Autocomplete shows matching medications
   - User selects medication

2. **Multiple Indications**
   - If medication has >1 indication, shows indication picker
   - User selects specific indication
   - If medication has 1 indication, auto-selects
   - If no indications, proceeds without indication

3. **Auto-Learning**
   - After user saves medication to HMR, call:
   ```typescript
   await addToKnowledgeBase({
     name: medication.name,
     strength: medication.strength,
     form: medication.form,
     indication: medication.indication
   })
   ```

4. **Knowledge Base Update**
   - Backend checks if medication exists
   - If exists: increments `usageCount`
   - If new: creates medication entry
   - If indication is new: adds to `medication_indications`
   - If indication exists: increments its `usageCount`

### Example Flow

```
User types "metf"
  ↓
Autocomplete searches medications
  ↓
Shows: "Metformin 500mg tablet (45 uses)"
       - Type 2 Diabetes (40x)
       - PCOS (5x)
  ↓
User clicks "Metformin"
  ↓
Shows indication picker (2 options)
  ↓
User selects "Type 2 Diabetes"
  ↓
Medication added to HMR
  ↓
System calls addToKnowledgeBase()
  ↓
Backend increments:
  - Metformin usageCount: 45 → 46
  - "Type 2 Diabetes" usageCount: 40 → 41
```

---

## Integration Points

### Where to Add MedicationAutocomplete

1. **HMR Medication Entry Form** - Primary location
2. **Quick Add Medication Modal** - Fast entry
3. **Medication Edit Form** - Update existing

### Example Integration

```tsx
// In your medication form component
import { MedicationAutocomplete } from '../components/hmr/MedicationAutocomplete'
import { addToKnowledgeBase } from '../services/medicationKnowledgeBase'

function MedicationForm({ hmrReviewId }: { hmrReviewId: number }) {
  const [medication, setMedication] = useState({
    name: '',
    strength: '',
    form: '',
    indication: '',
    dose: '',
    frequency: '',
  })

  const handleMedicationSelect = (selected) => {
    setMedication({
      ...medication,
      name: selected.name,
      strength: selected.strength || '',
      form: selected.form || '',
      indication: selected.indication || '',
    })
  }

  const handleSubmit = async () => {
    // 1. Save medication to HMR
    await api.post(`/hmr/reviews/${hmrReviewId}/medications`, medication)

    // 2. Add to knowledge base (auto-learning)
    await addToKnowledgeBase({
      name: medication.name,
      strength: medication.strength,
      form: medication.form,
      indication: medication.indication,
    })

    // 3. Reset form
    setMedication({
      name: '',
      strength: '',
      form: '',
      indication: '',
      dose: '',
      frequency: '',
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Autocomplete for medication selection */}
      <MedicationAutocomplete
        onSelect={handleMedicationSelect}
        placeholder="Search or add medication..."
      />

      {/* Other form fields */}
      <Input
        label="Dose"
        value={medication.dose}
        onChange={(e) => setMedication({ ...medication, dose: e.target.value })}
      />
      
      <Input
        label="Frequency"
        value={medication.frequency}
        onChange={(e) => setMedication({ ...medication, frequency: e.target.value })}
      />

      {/* If user types new medication, allow manual entry */}
      {medication.name && (
        <>
          <Input
            label="Strength"
            value={medication.strength}
            onChange={(e) => setMedication({ ...medication, strength: e.target.value })}
          />
          <Input
            label="Form"
            value={medication.form}
            onChange={(e) => setMedication({ ...medication, form: e.target.value })}
          />
          <Input
            label="Indication"
            value={medication.indication}
            onChange={(e) => setMedication({ ...medication, indication: e.target.value })}
          />
        </>
      )}

      <Button type="submit">Add Medication</Button>
    </form>
  )
}
```

---

## Benefits

### For Users (Pharmacists)

✅ **Faster data entry** - Autocomplete eliminates typing  
✅ **Consistent data** - Standardized medication names  
✅ **Smart suggestions** - Popular medications appear first  
✅ **Learn as you go** - System gets smarter with use  
✅ **Multiple indications** - Handle real-world complexity  

### For System

✅ **Data quality** - Fewer typos and variations  
✅ **Analytics ready** - Standardized data for reporting  
✅ **Scalable** - Indexed searches with Prisma  
✅ **Intelligent** - Usage tracking improves UX over time  

---

## Testing

### Manual Testing Steps

1. **Test Search**:
   ```bash
   curl http://localhost:4000/api/medications/search?q=metf \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

2. **Add Medication**:
   ```bash
   curl -X POST http://localhost:4000/api/medications/knowledge-base \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{
       "name": "Metformin",
       "strength": "500mg",
       "form": "tablet",
       "indication": "Type 2 Diabetes"
     }'
   ```

3. **Verify Usage Count**:
   - Add same medication again
   - Check `usageCount` incremented

4. **Test Multiple Indications**:
   - Add same medication with different indication
   - Verify both indications stored

### Frontend Testing

1. Open medication form
2. Type "met" in autocomplete
3. Verify suggestions appear
4. Select medication with multiple indications
5. Verify indication picker shows
6. Select indication
7. Verify fields populated

---

## Future Enhancements

### Planned Features

1. **Drug Interaction Checking**
   - Integrate with drug interaction APIs
   - Warn about contraindications

2. **Australian Medicines** - Pre-populate with PBS data
   - Import PBS (Pharmaceutical Benefits Scheme) medications
   - Include PBS restrictions and requirements

3. **Admin Dashboard**
   - View most-used medications
   - Merge duplicate entries
   - Edit/deactivate medications

4. **Bulk Import**
   - CSV upload for medication database
   - Import from MIMS or other sources

5. **AI-Powered Suggestions**
   - Use AWS Bedrock to suggest indications
   - Analyze prescription patterns

6. **Mobile Optimization**
   - Touch-friendly autocomplete
   - Offline medication database

---

## Troubleshooting

### Common Issues

#### Issue: Search returns no results
**Solution**: Check that `isActive = true` and medications exist in DB

#### Issue: Duplicate medications created
**Solution**: Unique constraint prevents this. Check name+strength+form combination

#### Issue: Autocomplete slow
**Solution**: 
- Check database indexes on `name`, `genericName`, `indication`
- Reduce search limit
- Increase debounce delay

#### Issue: Indication not saving
**Solution**: Check `addToKnowledgeBase()` is called after medication save

---

## Summary

✅ **Database**: Enhanced `medications` table + new `medication_indications` table  
✅ **Backend**: 5 new API endpoints + smart upsert logic  
✅ **Frontend**: MedicationAutocomplete component + service layer  
✅ **Features**: Auto-learning, multi-indication support, popularity tracking  
✅ **Ready**: Integration-ready for HMR medication forms  

**Next Step**: Integrate `MedicationAutocomplete` component into your medication entry forms!

---

Date: 1 October 2025  
Status: ✅ Complete - Ready for Integration
