import React, { useMemo, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
} from '../../components/ui';
import { useHmrDashboard } from '../../hooks/useHmrDashboard';
import type {
  CreateClinicPayload,
  CreateHmrReviewPayload,
  CreatePatientPayload,
  CreatePrescriberPayload,
  HmrReview,
  Patient,
  Clinic,
  Prescriber,
} from '../../types/hmr';

const statusVariantMap: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  PENDING: 'outline',
  ACCEPTED: 'secondary',
  SCHEDULED: 'secondary',
  IN_PROGRESS: 'default',
  COMPLETED: 'secondary',
  CLAIMED: 'default',
  CANCELLED: 'destructive',
};

const optionalEmail = z.string().optional();

const patientFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().optional(),
  contactEmail: optionalEmail,
  contactPhone: z.string().optional(),
  notes: z.string().optional(),
});

const prescriberFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  contactEmail: optionalEmail,
  contactPhone: z.string().optional(),
  clinicSelection: z.string().optional(),
  clinicName: z.string().optional(),
  clinicEmail: optionalEmail,
  clinicPhone: z.string().optional(),
});

const clinicFormSchema = z.object({
  name: z.string().min(1, 'Clinic name is required'),
  contactEmail: optionalEmail,
  contactPhone: z.string().optional(),
  suburb: z.string().optional(),
  state: z.string().optional(),
  notes: z.string().optional(),
});

const reviewFormSchema = z.object({
  patientId: z.string().min(1, 'Select a patient'),
  prescriberId: z.string().optional(),
  clinicId: z.string().optional(),
  referralDate: z.string().optional(),
  scheduledAt: z.string().optional(),
  followUpDueAt: z.string().optional(),
  referralReason: z.string().optional(),
  status: z.string().optional(),
});

type PatientFormValues = z.infer<typeof patientFormSchema>;
type PrescriberFormValues = z.infer<typeof prescriberFormSchema>;
type ClinicFormValues = z.infer<typeof clinicFormSchema>;
type ReviewFormValues = z.infer<typeof reviewFormSchema>;

type PrescriberFormMode = 'existing' | 'new';

const patientFormDefaults: PatientFormValues = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  contactEmail: '',
  contactPhone: '',
  notes: '',
};

const prescriberFormDefaults: PrescriberFormValues = {
  firstName: '',
  lastName: '',
  contactEmail: '',
  contactPhone: '',
  clinicSelection: '',
  clinicName: '',
  clinicEmail: '',
  clinicPhone: '',
};

const clinicFormDefaults: ClinicFormValues = {
  name: '',
  contactEmail: '',
  contactPhone: '',
  suburb: '',
  state: '',
  notes: '',
};

const reviewDefaultValues: ReviewFormValues = {
  patientId: '',
  prescriberId: '',
  clinicId: '',
  referralDate: '',
  scheduledAt: '',
  followUpDueAt: '',
  referralReason: '',
  status: 'PENDING',
};

const formatDate = (value: string | null) => {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(value));
  } catch (error) {
    return value;
  }
};

const formatStatusLabel = (status: string) => status.replace(/_/g, ' ');

const toDateInputValue = (value: string | null | undefined) => {
  if (!value) {
    return '';
  }
  return value.slice(0, 10);
};

const toDateTimeLocalValue = (value: string | null | undefined) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
};

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
    updateReview,
    deleteReview,
    updatePatient,
    deletePatient,
    updatePrescriber,
    deletePrescriber,
    updateClinic,
    deleteClinic,
  } = useHmrDashboard();

  const [isPatientDialogOpen, setPatientDialogOpen] = useState(false);
  const [isPrescriberDialogOpen, setPrescriberDialogOpen] = useState(false);
  const [isClinicDialogOpen, setClinicDialogOpen] = useState(false);
  const [isReviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [prescriberFormMode, setPrescriberFormMode] = useState<PrescriberFormMode>('existing');
  const [reviewDialogMode, setReviewDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedReview, setSelectedReview] = useState<HmrReview | null>(null);
  const [patientDialogMode, setPatientDialogMode] = useState<'create' | 'edit'>('create');
  const [prescriberDialogMode, setPrescriberDialogMode] = useState<'create' | 'edit'>('create');
  const [clinicDialogMode, setClinicDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedPrescriber, setSelectedPrescriber] = useState<Prescriber | null>(null);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [reviewPendingDelete, setReviewPendingDelete] = useState<HmrReview | null>(null);
  const [patientPendingDelete, setPatientPendingDelete] = useState<Patient | null>(null);
  const [prescriberPendingDelete, setPrescriberPendingDelete] = useState<Prescriber | null>(null);
  const [clinicPendingDelete, setClinicPendingDelete] = useState<Clinic | null>(null);
  const [isDeletingReview, setIsDeletingReview] = useState(false);
  const [isDeletingPatient, setIsDeletingPatient] = useState(false);
  const [isDeletingPrescriber, setIsDeletingPrescriber] = useState(false);
  const [isDeletingClinic, setIsDeletingClinic] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const patientForm = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: patientFormDefaults,
  });

  const prescriberForm = useForm<PrescriberFormValues>({
    resolver: zodResolver(prescriberFormSchema),
    defaultValues: prescriberFormDefaults,
  });

  const clinicForm = useForm<ClinicFormValues>({
    resolver: zodResolver(clinicFormSchema),
    defaultValues: clinicFormDefaults,
  });

  const reviewForm = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: reviewDefaultValues,
  });

  const resetPatientForm = () => {
    patientForm.reset();
    setPatientDialogOpen(false);
  };

  const resetPrescriberForm = () => {
    prescriberForm.reset();
    setPrescriberFormMode('existing');
    setPrescriberDialogOpen(false);
  };

  const resetReviewForm = () => {
    reviewForm.reset(reviewDefaultValues);
    setSelectedReview(null);
    setReviewDialogMode('create');
    setActionError(null);
  };

  const closeReviewDialog = () => {
    setReviewDialogOpen(false);
  };

  const openCreateReviewDialog = () => {
    resetReviewForm();
    setReviewDialogMode('create');
    setReviewDialogOpen(true);
  };

  const openEditReviewDialog = (review: HmrReview) => {
    setSelectedReview(review);
    setReviewDialogMode('edit');
    reviewForm.reset({
      patientId: String(review.patientId),
      prescriberId: review.prescriberId ? String(review.prescriberId) : '',
      clinicId: review.clinicId ? String(review.clinicId) : '',
      referralDate: toDateInputValue(review.referralDate),
      scheduledAt: toDateTimeLocalValue(review.scheduledAt),
      followUpDueAt: toDateInputValue(review.followUpDueAt),
      referralReason: review.referralReason ?? '',
      status: review.status,
    });
    setActionError(null);
    setReviewDialogOpen(true);
  };

  const onCreatePatient = async (values: PatientFormValues) => {
    const email = values.contactEmail?.trim();
    const payload: CreatePatientPayload = {
      firstName: values.firstName,
      lastName: values.lastName,
      dateOfBirth: values.dateOfBirth || undefined,
      contactEmail: email ? email : undefined,
      contactPhone: values.contactPhone || undefined,
      notes: values.notes || undefined,
    };

    await createPatient(payload);
    resetPatientForm();
  };

  const onCreatePrescriber = async (values: PrescriberFormValues) => {
    let clinicId: number | null = null;

    if (prescriberFormMode === 'existing' && values.clinicSelection) {
      clinicId = Number(values.clinicSelection);
    } else if (prescriberFormMode === 'existing' && !values.clinicSelection) {
      prescriberForm.setError('clinicSelection', {
        type: 'manual',
        message: 'Please choose a clinic or switch to "New Clinic".',
      });
      return;
    }

    if (prescriberFormMode === 'new') {
      if (!values.clinicName) {
        prescriberForm.setError('clinicName', {
          type: 'manual',
          message: 'Clinic name is required when creating a clinic.',
        });
        return;
      }
      const clinicEmail = values.clinicEmail?.trim();
      const clinicPayload: CreateClinicPayload = {
        name: values.clinicName,
        contactEmail: clinicEmail ? clinicEmail : undefined,
        contactPhone: values.clinicPhone || undefined,
      };
      const newClinic = await createClinic(clinicPayload);
      clinicId = newClinic.id;
    }

    const contactEmail = values.contactEmail?.trim();
    const payload: CreatePrescriberPayload = {
      firstName: values.firstName,
      lastName: values.lastName,
      contactEmail: contactEmail ? contactEmail : undefined,
      contactPhone: values.contactPhone || undefined,
      clinicId,
    };

    await createPrescriber(payload);
    resetPrescriberForm();
  };

  const onSubmitReview = async (values: ReviewFormValues) => {
    const payload: CreateHmrReviewPayload = {
      patientId: Number(values.patientId),
      prescriberId: values.prescriberId ? Number(values.prescriberId) : undefined,
      clinicId: values.clinicId ? Number(values.clinicId) : undefined,
      referralDate: values.referralDate || undefined,
      referralReason: values.referralReason?.trim() ? values.referralReason.trim() : undefined,
      scheduledAt: values.scheduledAt ? new Date(values.scheduledAt).toISOString() : undefined,
      followUpDueAt: values.followUpDueAt || undefined,
      status: (values.status as CreateHmrReviewPayload['status']) ?? undefined,
    };

    setActionError(null);

    try {
      if (reviewDialogMode === 'edit' && selectedReview) {
        await updateReview(selectedReview.id, payload);
      } else {
        await createReview(payload);
      }
      closeReviewDialog();
    } catch (submitError) {
      const message =
      submitError instanceof Error ? submitError.message : 'Failed to save HMR review';
      setActionError(message);
    }
  };

  const confirmDeleteReview = async () => {
    if (!reviewPendingDelete) {
      return;
    }

    setActionError(null);
    setIsDeletingReview(true);
    try {
      await deleteReview(reviewPendingDelete.id);
      setReviewPendingDelete(null);
    } catch (deleteError) {
      const message =
        deleteError instanceof Error ? deleteError.message : 'Failed to delete HMR review';
      setActionError(message);
    } finally {
      setIsDeletingReview(false);
    }
  };

  const sortedReviews = useMemo(() => {
    return [...reviews].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [reviews]);

  const upcomingFollowUps = useMemo(() => {
    return reviews.filter((review) => review.followUpDueAt && review.status !== 'CLAIMED');
  }, [reviews]);

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
          {actionError && (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-800">
              {actionError}
            </div>
          )}

          <section>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
              <StatsCard title="Patients" value={stats.totalPatients} description="Active in the HMR program" />
              <StatsCard title="Reviews in Progress" value={stats.activeReviews} description="Open or scheduled" />
              <StatsCard title="Follow-ups Due" value={stats.followUpsDue} description="Requires attention today" highlight={stats.followUpsDue > 0} />
              <StatsCard title="Prescribers" value={stats.prescriberCount} description="Linked referrers" />
            </div>
          </section>

          <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-heading font-semibold text-gray-900">Workflow Overview</h2>
              <p className="text-gray-600 font-body">Manage patients, prescribers, and HMR activity. Use the actions to add new records.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="default" onClick={openCreateReviewDialog}>
                New HMR Review
              </Button>
              <Button variant="secondary" onClick={() => setPatientDialogOpen(true)}>
                Add Patient
              </Button>
              <Button variant="outline" onClick={() => setPrescriberDialogOpen(true)}>
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
                    <CardTitle className="font-heading">Recent Reviews</CardTitle>
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
                              <TableHeaderCell>Actions</TableHeaderCell>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {sortedReviews.map((review) => (
                              <tr key={review.id} className="bg-white hover:bg-gray-50">
                                <TableCell>
                                  <span className="font-medium text-gray-900">
                                    {review.patient?.firstName} {review.patient?.lastName}
                                  </span>
                                  {review.referralReason && (
                                    <p className="text-sm text-gray-500">{review.referralReason}</p>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Badge variant={statusVariantMap[review.status] ?? 'outline'}>
                                    {formatStatusLabel(review.status)}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {review.prescriber
                                    ? `${review.prescriber.firstName} ${review.prescriber.lastName}`
                                    : '—'}
                                </TableCell>
                                <TableCell>{formatDate(review.referralDate)}</TableCell>
                                <TableCell>{formatDate(review.scheduledAt)}</TableCell>
                                <TableCell>{formatDate(review.followUpDueAt)}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => openEditReviewDialog(review)}
                                      aria-label="Edit HMR review"
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="text-red-600 hover:text-red-700"
                                      onClick={() => setReviewPendingDelete(review)}
                                      aria-label="Delete HMR review"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
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
                    {loading ? (
                      <LoadingState />
                    ) : patients.length === 0 ? (
                      <EmptyState message="No patients yet. Add a patient to begin the HMR process." />
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2">
                        {patients.map((patient) => (
                          <PatientSummaryCard key={patient.id} patient={patient} />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="prescribers">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-heading">Prescribers & Clinics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <LoadingState />
                    ) : prescribers.length === 0 ? (
                      <EmptyState message="You haven’t added any prescribers yet." />
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2">
                        {prescribers.map((prescriber) => (
                          <Card key={prescriber.id} className="border border-gray-200">
                            <CardHeader>
                              <CardTitle className="text-lg font-semibold text-gray-900">
                                {prescriber.honorific ? `${prescriber.honorific} ` : ''}
                                {prescriber.firstName} {prescriber.lastName}
                              </CardTitle>
                              {prescriber.clinic && (
                                <p className="text-sm text-gray-600">{prescriber.clinic.name}</p>
                              )}
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-gray-600">
                              {prescriber.contactEmail && <p>Email: {prescriber.contactEmail}</p>}
                              {prescriber.contactPhone && <p>Phone: {prescriber.contactPhone}</p>}
                              {prescriber.clinic?.suburb && (
                                <p>
                                  Suburb: {prescriber.clinic.suburb}
                                  {prescriber.clinic.state ? `, ${prescriber.clinic.state}` : ''}
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
                    <CardTitle className="font-heading">Follow-up Reminders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <LoadingState />
                    ) : upcomingFollowUps.length === 0 ? (
                      <EmptyState message="No follow-up reviews are due." />
                    ) : (
                      <div className="space-y-4">
                        {upcomingFollowUps.map((review) => (
                          <Card key={review.id} className="border border-amber-200 bg-amber-50">
                            <CardContent className="py-4">
                              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {review.patient?.firstName} {review.patient?.lastName}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Follow-up due {formatDate(review.followUpDueAt)} — status {review.status.replace('_', ' ')}
                                  </p>
                                </div>
                                <div className="text-sm text-gray-600">
                                  {review.prescriber && (
                                    <p>
                                      Prescriber: {review.prescriber.firstName} {review.prescriber.lastName}
                                    </p>
                                  )}
                                  {review.clinic && <p>Clinic: {review.clinic.name}</p>}
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
              Capture the basics so you can start an HMR referral for this patient.
            </DialogDescription>
          </DialogHeader>
          <Form {...patientForm}>
            <form className="space-y-4" onSubmit={patientForm.handleSubmit(onCreatePatient)}>
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
                      <Textarea rows={3} placeholder="Clinical notes, supports, key concerns" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetPatientForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={patientForm.formState.isSubmitting}>
                  {patientForm.formState.isSubmitting ? 'Saving...' : 'Save Patient'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isPrescriberDialogOpen} onOpenChange={setPrescriberDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Prescriber</DialogTitle>
            <DialogDescription>
              Link the prescriber to an existing clinic or create a new clinic in one step.
            </DialogDescription>
          </DialogHeader>
          <Form {...prescriberForm}>
            <form className="space-y-4" onSubmit={prescriberForm.handleSubmit(onCreatePrescriber)}>
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
                        <Input placeholder="prescriber@example.com" {...field} />
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
                    variant={prescriberFormMode === 'existing' ? 'default' : 'outline'}
                    onClick={() => setPrescriberFormMode('existing')}
                  >
                    Existing
                  </Button>
                  <Button
                    type="button"
                    variant={prescriberFormMode === 'new' ? 'default' : 'outline'}
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
                          value={field.value || undefined}
                          onValueChange={(value) => field.onChange(value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a clinic" />
                          </SelectTrigger>
                          <SelectContent>
                            {clinics.length === 0 ? (
                              <SelectItem value="__no_clinic" disabled>
                                No clinics available
                              </SelectItem>
                            ) : (
                              clinics.map((clinic) => (
                                <SelectItem key={clinic.id} value={String(clinic.id)}>
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
                          <Input placeholder="Example Medical Centre" {...field} />
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
                          <Input placeholder="team@examplemedical.com" {...field} />
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
                          <Input placeholder="Clinic contact number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetPrescriberForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={prescriberForm.formState.isSubmitting}>
                  {prescriberForm.formState.isSubmitting ? 'Saving...' : 'Save Prescriber'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isReviewDialogOpen}
        onOpenChange={(open) => {
          setReviewDialogOpen(open);
          if (!open) {
            resetReviewForm();
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {reviewDialogMode === 'edit' ? 'Update HMR Review' : 'Create HMR Review'}
            </DialogTitle>
            <DialogDescription>
              {reviewDialogMode === 'edit'
                ? 'Revise scheduling, referral notes, or assignment details for this review.'
                : 'Schedule the review, capture referral details, and assign the prescriber.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...reviewForm}>
            <form className="space-y-4" onSubmit={reviewForm.handleSubmit(onSubmitReview)}>
              <FormField
                control={reviewForm.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient</FormLabel>
                    <FormControl>
                      <Select value={field.value || undefined} onValueChange={(value) => field.onChange(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a patient" />
                        </SelectTrigger>
                        <SelectContent>
                          {patients.length === 0 ? (
                            <SelectItem value="__no_patient" disabled>
                              No patients available
                            </SelectItem>
                          ) : (
                            patients.map((patient) => (
                              <SelectItem key={patient.id} value={String(patient.id)}>
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
                          value={field.value || '__none'}
                          onValueChange={(value) => field.onChange(value === '__none' ? '' : value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select prescriber" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none">Unassigned</SelectItem>
                            {prescribers.map((prescriber) => (
                              <SelectItem key={prescriber.id} value={String(prescriber.id)}>
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
                          value={field.value || '__none'}
                          onValueChange={(value) => field.onChange(value === '__none' ? '' : value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select clinic" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none">Not specified</SelectItem>
                            {clinics.map((clinic) => (
                              <SelectItem key={clinic.id} value={String(clinic.id)}>
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
                      <Select value={field.value} onValueChange={(value) => field.onChange(value)}>
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
                      <Textarea rows={3} placeholder="Reason for referral, key issues to explore" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeReviewDialog}>
                  Cancel
                </Button>
                <Button type="submit" disabled={reviewForm.formState.isSubmitting}>
                  {reviewForm.formState.isSubmitting
                    ? reviewDialogMode === 'edit'
                      ? 'Updating...'
                      : 'Creating...'
                    : reviewDialogMode === 'edit'
                    ? 'Update Review'
                    : 'Create Review'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(reviewPendingDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setReviewPendingDelete(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete HMR Review</DialogTitle>
            <DialogDescription>
              {reviewPendingDelete ? (
                <span>
                  This will permanently remove the review for{' '}
                  <strong>
                    {reviewPendingDelete.patient
                      ? `${reviewPendingDelete.patient.firstName} ${reviewPendingDelete.patient.lastName}`
                      : 'the selected patient'}
                  </strong>
                  . This action cannot be undone.
                </span>
              ) : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setReviewPendingDelete(null)}
              disabled={isDeletingReview}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={confirmDeleteReview}
              disabled={isDeletingReview}
            >
              {isDeletingReview ? 'Deleting...' : 'Delete Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

interface PatientSummaryCardProps {
  patient: Patient;
}

const PatientSummaryCard: React.FC<PatientSummaryCardProps> = ({ patient }) => {
  return (
    <Card className="border border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">
          {patient.firstName} {patient.lastName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-gray-600">
        <p>Date of birth: {formatDate(patient.dateOfBirth)}</p>
        {patient.contactPhone && <p>Phone: {patient.contactPhone}</p>}
        {patient.contactEmail && <p>Email: {patient.contactEmail}</p>}
        {patient.notes && <p className="text-gray-500">{patient.notes}</p>}
      </CardContent>
    </Card>
  );
};

interface StatsCardProps {
  title: string;
  value: number;
  description: string;
  highlight?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, description, highlight }) => {
  return (
    <Card className={highlight ? 'border border-amber-300 bg-amber-50' : 'border border-gray-200'}>
      <CardContent className="pt-6">
        <p className="text-sm font-medium uppercase tracking-wide text-gray-500">{title}</p>
        <div className="mt-2 text-3xl font-heading font-semibold text-gray-900">{value}</div>
        <p className="mt-2 text-sm text-gray-600">{description}</p>
      </CardContent>
    </Card>
  );
};

const TableHeaderCell: React.FC<React.PropsWithChildren> = ({ children }) => (
  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
    {children}
  </th>
);

const TableCell: React.FC<React.PropsWithChildren> = ({ children }) => (
  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{children}</td>
);

const LoadingState: React.FC = () => (
  <div className="flex h-32 items-center justify-center text-sm text-gray-500">
    Loading data…
  </div>
);

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex h-32 items-center justify-center text-sm text-gray-500">
    {message}
  </div>
);

export default HmrDashboardPage;
