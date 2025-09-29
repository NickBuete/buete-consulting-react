import React, { useMemo, useState } from 'react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
  PageHero,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
} from '../../components/ui'
import { useHmrDashboard } from '../../hooks/useHmrDashboard'
import type {
  CreateClinicPayload,
  CreateHmrReviewPayload,
  CreatePatientPayload,
  CreatePrescriberPayload,
} from '../../types/hmr'
import { PatientList } from '../../components/crud/PatientList'

const statusVariantMap: Record<
  string,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  PENDING: 'outline',
  ACCEPTED: 'secondary',
  SCHEDULED: 'secondary',
  IN_PROGRESS: 'default',
  COMPLETED: 'secondary',
  CLAIMED: 'default',
  CANCELLED: 'destructive',
}

const optionalEmail = z.string().optional()

const patientFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().optional(),
  contactEmail: optionalEmail,
  contactPhone: z.string().optional(),
  notes: z.string().optional(),
})

const prescriberFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  contactEmail: optionalEmail,
  contactPhone: z.string().optional(),
  clinicSelection: z.string().optional(),
  clinicName: z.string().optional(),
  clinicEmail: optionalEmail,
  clinicPhone: z.string().optional(),
})

const reviewFormSchema = z.object({
  patientId: z.string().min(1, 'Select a patient'),
  prescriberId: z.string().optional(),
  clinicId: z.string().optional(),
  referralDate: z.string().optional(),
  scheduledAt: z.string().optional(),
  followUpDueAt: z.string().optional(),
  referralReason: z.string().optional(),
  status: z.string().optional(),
})

type PatientFormValues = z.infer<typeof patientFormSchema>
type PrescriberFormValues = z.infer<typeof prescriberFormSchema>
type ReviewFormValues = z.infer<typeof reviewFormSchema>

type PrescriberFormMode = 'existing' | 'new'

const formatDate = (value: string | null) => {
  if (!value) return '—'
  try {
    return new Intl.DateTimeFormat('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(value))
  } catch (error) {
    return value
  }
}

const HmrDashboardPage: React.FC = () => {
  const {
    patients,
    prescribers,
    clinics,
    reviews,
    stats,
    loading,
    error,
    createPatient,
    createPrescriber,
    createClinic,
    createReview,
    deletePatient,
    updatePatient,
  } = useHmrDashboard()

  const [isPatientDialogOpen, setPatientDialogOpen] = useState(false)
  const [isPrescriberDialogOpen, setPrescriberDialogOpen] = useState(false)
  const [isReviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [prescriberFormMode, setPrescriberFormMode] =
    useState<PrescriberFormMode>('existing')

  const patientForm = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      contactEmail: '',
      contactPhone: '',
      notes: '',
    },
  })

  const prescriberForm = useForm<PrescriberFormValues>({
    resolver: zodResolver(prescriberFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      contactEmail: '',
      contactPhone: '',
      clinicSelection: '',
      clinicName: '',
      clinicEmail: '',
      clinicPhone: '',
    },
  })

  const reviewForm = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      patientId: '',
      prescriberId: '',
      clinicId: '',
      referralDate: '',
      scheduledAt: '',
      followUpDueAt: '',
      referralReason: '',
      status: 'PENDING',
    },
  })

  const resetPatientForm = () => {
    patientForm.reset()
    setPatientDialogOpen(false)
  }

  const resetPrescriberForm = () => {
    prescriberForm.reset()
    setPrescriberFormMode('existing')
    setPrescriberDialogOpen(false)
  }

  const resetReviewForm = () => {
    reviewForm.reset({
      patientId: '',
      prescriberId: '',
      clinicId: '',
      referralDate: '',
      scheduledAt: '',
      followUpDueAt: '',
      referralReason: '',
      status: 'PENDING',
    })
    setReviewDialogOpen(false)
  }

  const onCreatePatient = async (values: PatientFormValues) => {
    const email = values.contactEmail?.trim()
    const payload: CreatePatientPayload = {
      firstName: values.firstName,
      lastName: values.lastName,
      dateOfBirth: values.dateOfBirth || undefined,
      contactEmail: email ? email : undefined,
      contactPhone: values.contactPhone || undefined,
      notes: values.notes || undefined,
    }

    await createPatient(payload)
    resetPatientForm()
  }

  const onCreatePrescriber = async (values: PrescriberFormValues) => {
    let clinicId: number | null = null

    if (prescriberFormMode === 'existing' && values.clinicSelection) {
      clinicId = Number(values.clinicSelection)
    } else if (prescriberFormMode === 'existing' && !values.clinicSelection) {
      prescriberForm.setError('clinicSelection', {
        type: 'manual',
        message: 'Please choose a clinic or switch to "New Clinic".',
      })
      return
    }

    if (prescriberFormMode === 'new') {
      if (!values.clinicName) {
        prescriberForm.setError('clinicName', {
          type: 'manual',
          message: 'Clinic name is required when creating a clinic.',
        })
        return
      }
      const clinicEmail = values.clinicEmail?.trim()
      const clinicPayload: CreateClinicPayload = {
        name: values.clinicName,
        contactEmail: clinicEmail ? clinicEmail : undefined,
        contactPhone: values.clinicPhone || undefined,
      }
      const newClinic = await createClinic(clinicPayload)
      clinicId = newClinic.id
    }

    const contactEmail = values.contactEmail?.trim()
    const payload: CreatePrescriberPayload = {
      firstName: values.firstName,
      lastName: values.lastName,
      contactEmail: contactEmail ? contactEmail : undefined,
      contactPhone: values.contactPhone || undefined,
      clinicId,
    }

    await createPrescriber(payload)
    resetPrescriberForm()
  }

  const onCreateReview = async (values: ReviewFormValues) => {
    const payload: CreateHmrReviewPayload = {
      patientId: Number(values.patientId),
      prescriberId: values.prescriberId
        ? Number(values.prescriberId)
        : undefined,
      clinicId: values.clinicId ? Number(values.clinicId) : undefined,
      referralDate: values.referralDate || undefined,
      referralReason: values.referralReason || undefined,
      scheduledAt: values.scheduledAt
        ? new Date(values.scheduledAt).toISOString()
        : undefined,
      followUpDueAt: values.followUpDueAt || undefined,
      status: (values.status as CreateHmrReviewPayload['status']) ?? undefined,
    }

    await createReview(payload)
    resetReviewForm()
  }

  const sortedReviews = useMemo(() => {
    return [...reviews].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }, [reviews])

  const upcomingFollowUps = useMemo(() => {
    return reviews.filter(
      (review) => review.followUpDueAt && review.status !== 'CLAIMED'
    )
  }, [reviews])

  return (
    <>
      <PageHero
        title="Home Medicines Review Dashboard"
        subtitle="Organise referrals, patient interviews, and follow-up workflows"
        description="Track patients, prescribers, and HMR progress in one place so you can focus on delivering actionable insights."
        backgroundVariant="gradient"
      />

      <main className="bg-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          <section>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
              <StatsCard
                title="Patients"
                value={stats.totalPatients}
                description="Active in the HMR program"
              />
              <StatsCard
                title="Reviews in Progress"
                value={stats.activeReviews}
                description="Open or scheduled"
              />
              <StatsCard
                title="Follow-ups Due"
                value={stats.followUpsDue}
                description="Requires attention today"
                highlight={stats.followUpsDue > 0}
              />
              <StatsCard
                title="Prescribers"
                value={stats.prescriberCount}
                description="Linked referrers"
              />
            </div>
          </section>

          <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-heading font-semibold text-gray-900">
                Workflow Overview
              </h2>
              <p className="text-gray-600 font-body">
                Manage patients, prescribers, and HMR activity. Use the actions
                to add new records.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="default"
                onClick={() => setReviewDialogOpen(true)}
              >
                New HMR Review
              </Button>
              <Button
                variant="secondary"
                onClick={() => setPatientDialogOpen(true)}
              >
                Add Patient
              </Button>
              <Button
                variant="outline"
                onClick={() => setPrescriberDialogOpen(true)}
              >
                Add Prescriber
              </Button>
            </div>
          </section>

          <section>
            <Tabs defaultValue="reviews">
              <TabsList className="mb-4">
                <TabsTrigger value="reviews">HMR Reviews</TabsTrigger>
                <TabsTrigger value="patients">Patients</TabsTrigger>
                <TabsTrigger value="prescribers">Prescribers</TabsTrigger>
                <TabsTrigger value="followups">Upcoming Follow-ups</TabsTrigger>
              </TabsList>

              <TabsContent value="reviews">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-heading">
                      Recent Reviews
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <LoadingState />
                    ) : sortedReviews.length === 0 ? (
                      <EmptyState message="No HMR reviews yet. Create your first review to get started." />
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <TableHeaderCell>Patient</TableHeaderCell>
                              <TableHeaderCell>Status</TableHeaderCell>
                              <TableHeaderCell>Prescriber</TableHeaderCell>
                              <TableHeaderCell>Referral Date</TableHeaderCell>
                              <TableHeaderCell>Scheduled</TableHeaderCell>
                              <TableHeaderCell>Follow-up</TableHeaderCell>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {sortedReviews.map((review) => (
                              <tr
                                key={review.id}
                                className="bg-white hover:bg-gray-50"
                              >
                                <TableCell>
                                  <span className="font-medium text-gray-900">
                                    {review.patient?.firstName}{' '}
                                    {review.patient?.lastName}
                                  </span>
                                  {review.referralReason && (
                                    <p className="text-sm text-gray-500">
                                      {review.referralReason}
                                    </p>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      statusVariantMap[review.status] ??
                                      'outline'
                                    }
                                  >
                                    {review.status.replace('_', ' ')}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {review.prescriber
                                    ? `${review.prescriber.firstName} ${review.prescriber.lastName}`
                                    : '—'}
                                </TableCell>
                                <TableCell>
                                  {formatDate(review.referralDate)}
                                </TableCell>
                                <TableCell>
                                  {formatDate(review.scheduledAt)}
                                </TableCell>
                                <TableCell>
                                  {formatDate(review.followUpDueAt)}
                                </TableCell>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="patients">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-heading">Patients</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PatientList
                      patients={patients}
                      onDelete={async (id) => {
                        try {
                          await deletePatient(id)
                        } catch (err) {
                          // Silently ignore or show a toast
                        }
                      }}
                      onUpdate={async (id, data) => {
                        try {
                          await updatePatient(id, data)
                        } catch (err) {
                          // Silently ignore or show a toast
                        }
                      }}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="prescribers">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-heading">
                      Prescribers & Clinics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <LoadingState />
                    ) : prescribers.length === 0 ? (
                      <EmptyState message="You haven’t added any prescribers yet." />
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2">
                        {prescribers.map((prescriber) => (
                          <Card
                            key={prescriber.id}
                            className="border border-gray-200"
                          >
                            <CardHeader>
                              <CardTitle className="text-lg font-semibold text-gray-900">
                                {prescriber.honorific
                                  ? `${prescriber.honorific} `
                                  : ''}
                                {prescriber.firstName} {prescriber.lastName}
                              </CardTitle>
                              {prescriber.clinic && (
                                <p className="text-sm text-gray-600">
                                  {prescriber.clinic.name}
                                </p>
                              )}
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-gray-600">
                              {prescriber.contactEmail && (
                                <p>Email: {prescriber.contactEmail}</p>
                              )}
                              {prescriber.contactPhone && (
                                <p>Phone: {prescriber.contactPhone}</p>
                              )}
                              {prescriber.clinic?.suburb && (
                                <p>
                                  Suburb: {prescriber.clinic.suburb}
                                  {prescriber.clinic.state
                                    ? `, ${prescriber.clinic.state}`
                                    : ''}
                                </p>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="followups">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-heading">
                      Follow-up Reminders
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <LoadingState />
                    ) : upcomingFollowUps.length === 0 ? (
                      <EmptyState message="No follow-up reviews are due." />
                    ) : (
                      <div className="space-y-4">
                        {upcomingFollowUps.map((review) => (
                          <Card
                            key={review.id}
                            className="border border-amber-200 bg-amber-50"
                          >
                            <CardContent className="py-4">
                              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {review.patient?.firstName}{' '}
                                    {review.patient?.lastName}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Follow-up due{' '}
                                    {formatDate(review.followUpDueAt)} — status{' '}
                                    {review.status.replace('_', ' ')}
                                  </p>
                                </div>
                                <div className="text-sm text-gray-600">
                                  {review.prescriber && (
                                    <p>
                                      Prescriber: {review.prescriber.firstName}{' '}
                                      {review.prescriber.lastName}
                                    </p>
                                  )}
                                  {review.clinic && (
                                    <p>Clinic: {review.clinic.name}</p>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </main>

      <Dialog open={isPatientDialogOpen} onOpenChange={setPatientDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Patient</DialogTitle>
            <DialogDescription>
              Capture the basics so you can start an HMR referral for this
              patient.
            </DialogDescription>
          </DialogHeader>
          <Form {...patientForm}>
            <form
              className="space-y-4"
              onSubmit={patientForm.handleSubmit(onCreatePatient)}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={patientForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First name</FormLabel>
                      <FormControl>
                        <Input placeholder="Jane" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={patientForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last name</FormLabel>
                      <FormControl>
                        <Input placeholder="Citizen" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={patientForm.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={patientForm.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Mobile or landline" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={patientForm.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="patient@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={patientForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Clinical notes, supports, key concerns"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetPatientForm}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={patientForm.formState.isSubmitting}
                >
                  {patientForm.formState.isSubmitting
                    ? 'Saving...'
                    : 'Save Patient'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isPrescriberDialogOpen}
        onOpenChange={setPrescriberDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Prescriber</DialogTitle>
            <DialogDescription>
              Link the prescriber to an existing clinic or create a new clinic
              in one step.
            </DialogDescription>
          </DialogHeader>
          <Form {...prescriberForm}>
            <form
              className="space-y-4"
              onSubmit={prescriberForm.handleSubmit(onCreatePrescriber)}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={prescriberForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First name</FormLabel>
                      <FormControl>
                        <Input placeholder="Alex" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={prescriberForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last name</FormLabel>
                      <FormControl>
                        <Input placeholder="Smith" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={prescriberForm.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="prescriber@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={prescriberForm.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Contact number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-2">
                <FormLabel>Clinic</FormLabel>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={
                      prescriberFormMode === 'existing' ? 'default' : 'outline'
                    }
                    onClick={() => setPrescriberFormMode('existing')}
                  >
                    Existing
                  </Button>
                  <Button
                    type="button"
                    variant={
                      prescriberFormMode === 'new' ? 'default' : 'outline'
                    }
                    onClick={() => setPrescriberFormMode('new')}
                  >
                    New Clinic
                  </Button>
                </div>
              </div>

              {prescriberFormMode === 'existing' ? (
                <FormField
                  control={prescriberForm.control}
                  name="clinicSelection"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select clinic</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={(value) => field.onChange(value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a clinic" />
                          </SelectTrigger>
                          <SelectContent>
                            {clinics.length === 0 ? (
                              <SelectItem value="none">
                                No clinics available
                              </SelectItem>
                            ) : (
                              clinics.map((clinic) => (
                                <SelectItem
                                  key={clinic.id}
                                  value={String(clinic.id)}
                                >
                                  {clinic.name}
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
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={prescriberForm.control}
                    name="clinicName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Clinic name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Example Medical Centre"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={prescriberForm.control}
                    name="clinicEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Clinic email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="team@examplemedical.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={prescriberForm.control}
                    name="clinicPhone"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Clinic phone</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Clinic contact number"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetPrescriberForm}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={prescriberForm.formState.isSubmitting}
                >
                  {prescriberForm.formState.isSubmitting
                    ? 'Saving...'
                    : 'Save Prescriber'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isReviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create HMR Review</DialogTitle>
            <DialogDescription>
              Schedule the review, capture referral details, and assign the
              prescriber.
            </DialogDescription>
          </DialogHeader>
          <Form {...reviewForm}>
            <form
              className="space-y-4"
              onSubmit={reviewForm.handleSubmit(onCreateReview)}
            >
              <FormField
                control={reviewForm.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={(value) => field.onChange(value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a patient" />
                        </SelectTrigger>
                        <SelectContent>
                          {patients.length === 0 ? (
                            <SelectItem value="">
                              No patients available
                            </SelectItem>
                          ) : (
                            patients.map((patient) => (
                              <SelectItem
                                key={patient.id}
                                value={String(patient.id)}
                              >
                                {patient.firstName} {patient.lastName}
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

              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={reviewForm.control}
                  name="prescriberId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prescriber (optional)</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={(value) => field.onChange(value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select prescriber" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Unassigned</SelectItem>
                            {prescribers.map((prescriber) => (
                              <SelectItem
                                key={prescriber.id}
                                value={String(prescriber.id)}
                              >
                                {prescriber.firstName} {prescriber.lastName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={reviewForm.control}
                  name="clinicId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clinic (optional)</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={(value) => field.onChange(value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select clinic" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Not specified</SelectItem>
                            {clinics.map((clinic) => (
                              <SelectItem
                                key={clinic.id}
                                value={String(clinic.id)}
                              >
                                {clinic.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <FormField
                  control={reviewForm.control}
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
                  control={reviewForm.control}
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
                  control={reviewForm.control}
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

              <FormField
                control={reviewForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={(value) => field.onChange(value)}
                      >
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
                          ].map((status) => (
                            <SelectItem key={status} value={status}>
                              {status.replace('_', ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={reviewForm.control}
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetReviewForm}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={reviewForm.formState.isSubmitting}
                >
                  {reviewForm.formState.isSubmitting
                    ? 'Creating...'
                    : 'Create Review'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  )
}

interface StatsCardProps {
  title: string
  value: number
  description: string
  highlight?: boolean
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  highlight,
}) => {
  return (
    <Card
      className={
        highlight
          ? 'border border-amber-300 bg-amber-50'
          : 'border border-gray-200'
      }
    >
      <CardContent className="pt-6">
        <p className="text-sm font-medium uppercase tracking-wide text-gray-500">
          {title}
        </p>
        <div className="mt-2 text-3xl font-heading font-semibold text-gray-900">
          {value}
        </div>
        <p className="mt-2 text-sm text-gray-600">{description}</p>
      </CardContent>
    </Card>
  )
}

const TableHeaderCell: React.FC<React.PropsWithChildren> = ({ children }) => (
  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
    {children}
  </th>
)

const TableCell: React.FC<React.PropsWithChildren> = ({ children }) => (
  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
    {children}
  </td>
)

const LoadingState: React.FC = () => (
  <div className="flex h-32 items-center justify-center text-sm text-gray-500">
    Loading data…
  </div>
)

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex h-32 items-center justify-center text-sm text-gray-500">
    {message}
  </div>
)

export default HmrDashboardPage
