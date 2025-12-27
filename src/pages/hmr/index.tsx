import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useHmrDashboard } from '../../hooks/useHmrDashboard'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Table,
  EmptyState,
  LoadingState,
  StatsCard,
} from '../../components/ui'
import { PatientList } from '../../components/crud/PatientList'
import { AddPatientDialog } from '../../components/crud/AddPatientDialog'
import { AddPrescriberDialog } from '../../components/crud/AddPrescriberDialog'
import {
  AddReviewDialog,
  HmrReviewFormValues,
} from '../../components/crud/AddReviewDialog'
import { WorkflowStatus } from '../../components/hmr'
import { formatDate } from '../../utils/dashboard'
import { InlineBookingWidget } from '../../components/booking/InlineBookingWidget'
import { useAuth } from '../../context/AuthContext'

const HmrDashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [selectedReview, setSelectedReview] = React.useState<any>(null)
  const handleReviewRowClick = (review: any) => {
    navigate(`/hmr/${review.id}`)
  }
  const {
    patients,
    prescribers,
    clinics,
    reviews,
    loading,
    deletePatient,
    updatePatient,
    createPatient,
    createPrescriber,
    createReview,
    updateReview,
    deleteReview,
    stats,
  } = useHmrDashboard()

  // Dialog state
  const [isPatientDialogOpen, setPatientDialogOpen] = React.useState(false)
  const [isPrescriberDialogOpen, setPrescriberDialogOpen] =
    React.useState(false)
  const [isReviewDialogOpen, setReviewDialogOpen] = React.useState(false)

  // Form state and handlers
  const patientForm = useForm({ defaultValues: {} })
  const prescriberForm = useForm({ defaultValues: {} })
  const reviewForm = useForm<HmrReviewFormValues>({ defaultValues: {} })
  const [prescriberFormMode, setPrescriberFormMode] = React.useState<
    'existing' | 'new'
  >('existing')
  const onCreatePatient = async (values: any) => {
    await createPatient(values)
  }
  const resetPatientForm = () => {
    patientForm.reset()
    setPatientDialogOpen(false)
  }
  const onCreatePrescriber = async (values: any) => {
    if (prescriberFormMode === 'new') {
      await createPrescriber({
        ...values,
        clinic: {
          name: values.clinicName,
          email: values.clinicEmail,
          phone: values.clinicPhone,
        },
      })
    } else {
      await createPrescriber({
        ...values,
        clinicId: values.clinicSelection
          ? Number(values.clinicSelection)
          : undefined,
      })
    }
  }
  const resetPrescriberForm = () => {
    prescriberForm.reset()
    setPrescriberDialogOpen(false)
    setPrescriberFormMode('existing')
  }
  const onCreateReview = async (values: any) => {
    await createReview({
      ...values,
      patientId: values.patientId ? Number(values.patientId) : undefined,
      prescriberId: values.prescriberId
        ? Number(values.prescriberId)
        : undefined,
      clinicId: values.clinicId ? Number(values.clinicId) : undefined,
    })
  }
  const upcomingFollowUps: any[] = []
  const resetReviewForm = () => {
    reviewForm.reset()
    setReviewDialogOpen(false)
  }
  const sortedReviews = React.useMemo(() => {
    if (!Array.isArray(reviews)) return []
    return [...reviews].sort((a, b) => {
      const dateA = new Date(a.referralDate || 0).getTime()
      const dateB = new Date(b.referralDate || 0).getTime()
      return dateB - dateA
    })
  }, [reviews])

  return (
    <>
      <main className="bg-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Dialogs */}
          <AddPatientDialog
            open={isPatientDialogOpen}
            onOpenChange={setPatientDialogOpen}
            form={patientForm}
            onSubmit={onCreatePatient}
            onCancel={resetPatientForm}
          />
          <AddPrescriberDialog
            open={isPrescriberDialogOpen}
            onOpenChange={setPrescriberDialogOpen}
            form={prescriberForm}
            clinics={clinics}
            formMode={prescriberFormMode}
            setFormMode={setPrescriberFormMode}
            onSubmit={onCreatePrescriber}
            onCancel={resetPrescriberForm}
          />
          <AddReviewDialog
            open={isReviewDialogOpen}
            onOpenChange={setReviewDialogOpen}
            form={reviewForm}
            patients={patients}
            prescribers={prescribers}
            clinics={clinics}
            review={selectedReview}
            onSubmit={
              selectedReview
                ? async (values) => {
                    // Convert null patientId to undefined for backend compatibility
                    const payload = {
                      ...values,
                      patientId:
                        values.patientId === null
                          ? undefined
                          : values.patientId,
                    }
                    await updateReview(selectedReview.id, payload)
                    setSelectedReview(null)
                    resetReviewForm()
                  }
                : onCreateReview
            }
            onDelete={
              selectedReview
                ? async () => {
                    await deleteReview(selectedReview.id)
                    setSelectedReview(null)
                    resetReviewForm()
                  }
                : undefined
            }
            onCancel={() => {
              setSelectedReview(null)
              resetReviewForm()
            }}
          />

          {/* Workflow Overview and Actions */}
          <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-heading font-semibold text-gray-900">
                Workflow Overview
              </h2>
              <p className="text-gray-600 font-body">
                Manage patients, prescribers, and HMR activity. Use the actions
                to add new records.
              </p>
              <div className="mt-6">
                <StatsCard
                  stats={{
                    patients: stats.totalPatients,
                    prescribers: stats.prescriberCount,
                    clinics: clinics.length,
                    reviews: stats.activeReviews,
                  }}
                />
              </div>
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

          {/* Inline Booking Widget */}
          {user && (
            <section>
              <InlineBookingWidget pharmacistId={user.id} showTitle={true} />
            </section>
          )}

          {/* Tabs and Content */}
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
                      <Table
                        headers={[
                          'Patient',
                          'Status',
                          'Prescriber',
                          'Referral Date',
                          'Scheduled',
                          'Follow-up',
                        ]}
                      >
                        {sortedReviews.map((review) => (
                          <tr
                            key={review.id}
                            className="bg-white hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleReviewRowClick(review)}
                          >
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                              <span className="font-medium text-gray-900">
                                {review.patient?.firstName}{' '}
                                {review.patient?.lastName}
                              </span>
                              {review.referralReason && (
                                <p className="text-sm text-gray-500">
                                  {review.referralReason}
                                </p>
                              )}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                              <WorkflowStatus status={review.status} />
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                              {review.prescriber
                                ? `${review.prescriber.firstName} ${review.prescriber.lastName}`
                                : '—'}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                              {formatDate(review.referralDate)}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                              {formatDate(review.scheduledAt)}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                              {formatDate(review.followUpDueAt)}
                            </td>
                          </tr>
                        ))}
                      </Table>
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
    </>
  )
}

export default HmrDashboardPage
