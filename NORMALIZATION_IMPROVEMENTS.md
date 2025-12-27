# Database Normalization Improvements

## Summary

This document outlines the database normalization improvements applied to the Prisma schema to follow best practices for 1NF, 2NF, and 3NF.

## Date: 2025-12-27

## Changes Applied

### 1. First Normal Form (1NF) - Interview Symptom Fields

**Problem**: The `HmrReview` model had 17 separate columns for interview symptoms, creating a repeating group pattern that violates 1NF.

**Columns Removed**:
- dizziness
- drowsiness
- fatigue
- memory
- anxiety
- sleep
- headaches
- pain
- mobility
- falls
- bladderControl
- bowelControl
- nightSymptoms
- signsOfBleeding
- rashes
- bruising
- socialSupport

**Solution**: Created a new `HmrInterviewResponse` model following the Entity-Attribute-Value (EAV) pattern:

```prisma
model HmrInterviewResponse {
  id          Int       @id @default(autoincrement())
  hmrReviewId Int       @map("hmr_review_id")
  category    String    @db.VarChar(100)
  response    String?   @db.Text
  createdAt   DateTime  @default(now()) @map("created_at") @db.Timestamp(6)
  updatedAt   DateTime  @updatedAt @map("updated_at") @db.Timestamp(6)
  hmrReview   HmrReview @relation(fields: [hmrReviewId], references: [id], onDelete: Cascade)

  @@unique([hmrReviewId, category])
  @@index([hmrReviewId])
  @@map("hmr_interview_responses")
}
```

**Benefits**:
- Eliminates repeating groups
- Allows dynamic addition of new symptom categories without schema changes
- Reduces NULL values in the database
- More flexible and maintainable

### 2. Database Indexes Added

Added missing indexes on frequently queried fields to improve query performance:

#### HmrReview Model
```prisma
@@index([status])
@@index([referralDate])
```

#### HmrActionItem Model
```prisma
@@index([status])
@@index([dueDate])
```

#### User Model
```prisma
@@index([microsoftEmail])
```

#### Patient Model
```prisma
@@index([medicareNumber])
```

**Benefits**:
- Faster lookups by status fields
- Improved performance for date-based queries
- Better search performance for email and Medicare number lookups

## Migration Applied

Migration was applied successfully using:
```bash
npx prisma db push
```

## Identified Issues (Not Yet Addressed)

The following normalization issues were identified but marked as medium/low priority:

### Medium Priority
1. **Living Arrangement Duplication** - `PatientDetails.livingArrangement` duplicates `Patient.livingArrangement`
2. **Address Consolidation** - Multiple address fields could be consolidated into an Address model
3. **Redundant Owner ID** - `Patient.ownerId` is redundant with foreign key relationships

### Low Priority
1. **Soft Delete Support** - Missing `deletedAt` fields for audit trails
2. **Date Data Types** - `HmrPathology.testDate` and `HmrMedicalHistory.diagnosisDate` should use Date instead of String

## Impact Assessment

### Data Migration Required
When implementing this change in production, existing data from the 17 symptom columns needs to be migrated to the new `HmrInterviewResponse` table.

Example migration script pattern:
```sql
-- For each symptom column, create corresponding interview response records
INSERT INTO hmr_interview_responses (hmr_review_id, category, response, created_at, updated_at)
SELECT id, 'dizziness', dizziness, created_at, updated_at
FROM hmr_reviews
WHERE dizziness IS NOT NULL;

-- Repeat for all 17 symptom columns
```

### Application Code Updates Required
Any code that accesses these symptom fields directly will need to be updated to query the `HmrInterviewResponse` relation instead.

## Recommendations

1. **Immediate**: Test the new normalized structure thoroughly before deploying to production
2. **Before Production**: Create and test data migration scripts
3. **Before Production**: Update all application code that accesses symptom fields
4. **Future**: Consider addressing medium-priority normalization issues
5. **Future**: Add database constraints and validation rules to maintain data integrity

## Files Modified

- `/Users/nicholasbuete/dev/buete-consulting-react/server/prisma/schema.prisma`

## Related Documentation

- [Database Schema](server/prisma/schema.prisma)
- [Phase 2 Progress](PHASE2_PROGRESS.md)
