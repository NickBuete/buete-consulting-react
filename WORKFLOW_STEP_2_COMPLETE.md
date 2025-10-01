# Step 2 Complete: Status Transition Validation & Automatic Timestamps

## ✅ Completed Tasks

### 1. Backend Workflow Validation Logic

#### Created `server/src/utils/workflowValidation.ts`

- **WORKFLOW_TRANSITIONS**: Complete mapping of valid status transitions
  - Enforces proper workflow progression
  - Allows some backwards transitions for corrections (e.g., REPORT_READY → REPORT_DRAFT)
  - Prevents invalid jumps in the workflow
- **STATUS_TIMESTAMP_MAP**: Links each status to its timestamp field

- **Helper Functions**:
  - `isValidTransition()` - Validates if a status change is allowed
  - `getTimestampField()` - Gets the timestamp field name for a status
  - `calculateFollowUpDate()` - Calculates 3-month follow-up date
  - `InvalidTransitionError` - Custom error class for workflow violations
  - `validateStatusTransition()` - Returns validation result with user-friendly message

### 2. Enhanced HMR Review Service

#### Updated `server/src/services/hmrReviewService.ts`

- **`applyStatusTimestamps()`** function:

  - Automatically sets timestamps when status changes
  - Handles special cases (e.g., interview completion, follow-up date calculation)
  - Only sets timestamps if not already set (allows manual overrides)

- **Enhanced `updateHmrReview()`**:
  - Validates status transitions before applying changes
  - Throws `InvalidTransitionError` for invalid transitions
  - Automatically updates relevant timestamps
  - Maintains data integrity throughout workflow

### 3. API Error Handling

#### Updated `server/src/routes/hmrReviewRoutes.ts`

- Enhanced `handlePrismaError()` to handle `InvalidTransitionError`
- Returns HTTP 422 (Unprocessable Entity) for workflow violations
- Provides detailed error messages with current and attempted statuses

### 4. Frontend Workflow Validation

#### Created `src/utils/workflowValidation.ts`

- **WORKFLOW_TRANSITIONS**: Client-side validation matching backend
- **canTransitionTo()**: Check if transition is valid before API call
- **getAvailableTransitions()**: Get list of next valid statuses
- **getTransitionError()**: User-friendly error messages
- **WORKFLOW_STAGE_ACTIONS**: UI metadata for each status
  - Action labels (e.g., "Accept Referral", "Start Interview")
  - Descriptions for clarity
  - Icons for visual feedback
- **getPrimaryAction()**: Gets the most common next step

### 5. Workflow UI Components

#### Created `<WorkflowActionButton>` Component

- Smart button that knows what actions are available
- Shows primary action with appropriate icon
- Displays loading state during transitions
- Shows "Cancel" option when available
- Handles API calls and error states
- **Props**:
  - `currentStatus` - Current review status
  - `onTransition` - Callback for status changes
  - `loading` - Loading state
  - `disabled` - Disable button

#### Created `<WorkflowInfoCard>` Component

- Comprehensive status card showing:
  - Current workflow status badge
  - Timeline of completed stages (last 3 timestamps)
  - Patient and prescriber information
  - Action button for next step
- Perfect for detail views and dashboards
- **Props**:
  - `review` - Full HMR review object
  - `onStatusChange` - Callback for transitions
  - `loading` - Loading state

## 🎨 Design Patterns Applied

### 1. **Validation at Multiple Layers**

- Client-side: Prevents invalid UI states
- API route: Validates before service layer
- Service layer: Business logic enforcement
- Database: Schema constraints

### 2. **Automatic Side Effects**

- Timestamps updated automatically on status changes
- Follow-up dates calculated when review is claimed
- No manual timestamp management required

### 3. **Error Handling Pyramid**

```
User sees: "Cannot move from SCHEDULED to REPORT_DRAFT"
Frontend: Validates before API call
API: Returns 422 with detailed error
Service: Throws InvalidTransitionError
```

### 4. **DRY Principle**

- Single source of truth for workflow rules (shared constant)
- Reusable validation functions
- Consistent error messages across layers

### 5. **Progressive Enhancement**

- Works without JavaScript (API validates)
- Client-side validation improves UX
- Both layers stay in sync

## 📁 Files Created/Modified

### Created:

- `server/src/utils/workflowValidation.ts`
- `src/utils/workflowValidation.ts`
- `src/components/hmr/WorkflowActionButton.tsx`
- `src/components/hmr/WorkflowInfoCard.tsx`

### Modified:

- `server/src/services/hmrReviewService.ts`
- `server/src/routes/hmrReviewRoutes.ts`
- `src/components/hmr/index.ts`

## 🔒 Workflow Integrity Rules

### Enforced Transitions:

```
PENDING → ACCEPTED → SCHEDULED → DATA_ENTRY → INTERVIEW
         ↓           ↓            ↓            ↓
    CANCELLED   CANCELLED    CANCELLED    CANCELLED

INTERVIEW → REPORT_DRAFT → REPORT_READY → SENT_TO_PRESCRIBER
    ↓            ↓ ↑            ↓ ↑             ↓
CANCELLED   CANCELLED      CANCELLED        CANCELLED

SENT_TO_PRESCRIBER → CLAIMED → FOLLOW_UP_DUE → COMPLETED
         ↓              ↓            ↓
    CANCELLED      CANCELLED    CANCELLED
```

### Special Rules:

- ✅ Can go back from REPORT_READY to REPORT_DRAFT for corrections
- ✅ Can go back from REPORT_DRAFT to INTERVIEW for more data
- ✅ COMPLETED and CANCELLED are terminal states
- ✅ Follow-up date auto-calculated when claiming
- ✅ Timestamps only set once (preserves history)

## 🎯 Example Usage

```typescript
// In a component
import { WorkflowInfoCard } from '../../components/hmr'

;<WorkflowInfoCard
  review={reviewData}
  onStatusChange={async (newStatus) => {
    await updateReview(reviewId, { status: newStatus })
    // Timestamps updated automatically!
  }}
/>
```

## ✅ Build Status

- ✅ Frontend builds successfully
- ✅ All TypeScript types valid
- ✅ Components properly exported

## 🎯 Next Steps (Step 3)

Now ready to implement:

1. **Stage-Specific Forms**

   - Data Entry form (past medical history, medications, allergies, pathology)
   - Interview form (matching sample)
   - Report generation UI with TipTap

2. **Detail View Pages**
   - Individual review detail page
   - Stage-based navigation
   - Context-aware forms

Would you like me to proceed with Step 3?
