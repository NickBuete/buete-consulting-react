import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Input,
  Textarea,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../ui'
import type { UseFormReturn } from 'react-hook-form'

export type HmrReviewFormValues = {
  patientId: number | null
  prescriberId: number | null
  clinicId: number | null
  referralDate: string
  scheduledAt: string
  followUpDueAt: string
  status:
    | 'PENDING'
    | 'ACCEPTED'
    | 'SCHEDULED'
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'CLAIMED'
    | 'CANCELLED'
  referralReason: string
}

export interface AddReviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  form: UseFormReturn<HmrReviewFormValues>
  patients: Array<{
    id: number
    firstName: string
    lastName: string
    dateOfBirth?: string | null
    contactEmail?: string | null
    contactPhone?: string | null
    medicareNumber?: string | null
  }>
  prescribers: Array<{ id: number; firstName: string; lastName: string }>
  clinics: Array<{ id: number; name: string }>
  onSubmit: (values: HmrReviewFormValues) => Promise<void>
  onCancel: () => void
  review?: unknown
  onDelete?: () => Promise<void>
}

export const AddReviewDialog: React.FC<AddReviewDialogProps> = ({
  open,
  onOpenChange,
  form,
  patients,
  prescribers,
  clinics,
  onSubmit,
  onCancel,
  review,
  onDelete,
}) => {
  const selectedPatient = patients.find((p) => p.id === form.watch('patientId'))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {review ? 'Edit HMR Review' : 'Create HMR Review'}
          </DialogTitle>
          <DialogDescription>
            Schedule the review, capture referral details, and assign the
            prescriber.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            {/* Patient selection */}
            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient</FormLabel>
                  <FormControl>
                    <Select
                      value={
                        field.value !== null ? String(field.value) : undefined
                      }
                      onValueChange={(v) =>
                        field.onChange(v ? Number(v) : null)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {patients.length === 0 ? (
                          <SelectItem value="__none" disabled>
                            No patients available
                          </SelectItem>
                        ) : (
                          patients.map((p) => (
                            <SelectItem key={p.id} value={String(p.id)}>
                              {p.firstName} {p.lastName}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Patient details */}
            {selectedPatient && (
              <div className="mb-4 rounded border bg-gray-50 p-4 text-sm">
                <div className="font-semibold text-gray-800">
                  {selectedPatient.firstName} {selectedPatient.lastName}
                </div>
                {selectedPatient.dateOfBirth && (
                  <div>Date of Birth: {selectedPatient.dateOfBirth}</div>
                )}
                {selectedPatient.contactEmail && (
                  <div>Email: {selectedPatient.contactEmail}</div>
                )}
                {selectedPatient.contactPhone && (
                  <div>Phone: {selectedPatient.contactPhone}</div>
                )}
                {selectedPatient.medicareNumber && (
                  <div>Medicare: {selectedPatient.medicareNumber}</div>
                )}
              </div>
            )}

            {/* Prescriber (optional) */}
            <FormField
              control={form.control}
              name="prescriberId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prescriber (optional)</FormLabel>
                  <FormControl>
                    <Select
                      value={
                        field.value !== null
                          ? String(field.value)
                          : 'unassigned'
                      }
                      onValueChange={(v) =>
                        field.onChange(v === 'unassigned' ? null : Number(v))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select prescriber" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {prescribers.map((pr) => (
                          <SelectItem key={pr.id} value={String(pr.id)}>
                            {pr.firstName} {pr.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Clinic (optional) */}
            <FormField
              control={form.control}
              name="clinicId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Clinic (optional)</FormLabel>
                  <FormControl>
                    <Select
                      value={
                        field.value !== null ? String(field.value) : 'no-clinic'
                      }
                      onValueChange={(v) =>
                        field.onChange(v === 'no-clinic' ? null : Number(v))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select clinic" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-clinic">Not specified</SelectItem>
                        {clinics.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="referralDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Referral date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="scheduledAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scheduled interview</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="followUpDueAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Follow-up due</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          'PENDING',
                          'ACCEPTED',
                          'SCHEDULED',
                          'IN_PROGRESS',
                          'COMPLETED',
                          'CLAIMED',
                          'CANCELLED',
                        ].map((s) => (
                          <SelectItem key={s} value={s}>
                            {s.replace(/_/g, ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Referral reason */}
            <FormField
              control={form.control}
              name="referralReason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referral reason</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Reason for referral, key issues to explore"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <>
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
                {review && onDelete && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={onDelete}
                  >
                    Delete
                  </Button>
                )}
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting
                    ? review
                      ? 'Saving...'
                      : 'Creating...'
                    : review
                    ? 'Save Changes'
                    : 'Create Review'}
                </Button>
              </>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
