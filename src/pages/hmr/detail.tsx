import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Card,
  CardContent,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Button,
  LoadingState,
} from '../../components/ui'
import {
  WorkflowProgress,
  WorkflowInfoCard,
  DataEntryForm,
  InterviewForm,
  ReportForm,
} from '../../components/hmr'
import { ArrowLeft } from 'lucide-react'
import type { HmrReview } from '../../types/hmr'
import { getHmrReviewById, updateHmrReview } from '../../services/hmr'

const HmrReviewDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [review, setReview] = React.useState<HmrReview | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState('overview')

  React.useEffect(() => {
    loadReview()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const loadReview = async () => {
    if (!id) return
    try {
      setLoading(true)
      const data = await getHmrReviewById(Number(id))
      setReview(data)

      // Auto-select appropriate tab based on status
      if (data.status === 'DATA_ENTRY') {
        setActiveTab('data-entry')
      } else if (data.status === 'INTERVIEW') {
        setActiveTab('interview')
      } else if (['REPORT_DRAFT', 'REPORT_READY'].includes(data.status)) {
        setActiveTab('report')
      }
    } catch (error) {
      console.error('Failed to load review:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: HmrReview['status']) => {
    if (!review) return
    try {
      setSaving(true)
      await updateHmrReview(review.id, { status: newStatus })
      await loadReview()
    } catch (error: any) {
      console.error('Failed to update status:', error)
      alert(error.message || 'Failed to update status')
    } finally {
      setSaving(false)
    }
  }

  const handleDataEntrySubmit = async (data: Partial<HmrReview>) => {
    if (!review) return
    try {
      setSaving(true)
      await updateHmrReview(review.id, data)
      await loadReview()
      alert('Data entry saved successfully')
    } catch (error) {
      console.error('Failed to save data entry:', error)
      alert('Failed to save data entry')
    } finally {
      setSaving(false)
    }
  }

  const handleInterviewSubmit = async (data: Partial<HmrReview>) => {
    if (!review) return
    try {
      setSaving(true)
      await updateHmrReview(review.id, data)
      await loadReview()
      alert('Interview data saved successfully')
    } catch (error) {
      console.error('Failed to save interview:', error)
      alert('Failed to save interview')
    } finally {
      setSaving(false)
    }
  }

  const handleReportSubmit = async (data: Partial<HmrReview>) => {
    if (!review) return
    try {
      setSaving(true)
      await updateHmrReview(review.id, data)
      await loadReview()
      alert('Report saved successfully')
    } catch (error) {
      console.error('Failed to save report:', error)
      alert('Failed to save report')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <LoadingState />
        </div>
      </div>
    )
  }

  if (!review) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="py-12 text-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Review not found
              </h2>
              <Button
                variant="outline"
                onClick={() => navigate('/hmr')}
                className="mt-4"
              >
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/hmr')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">
              HMR Review #{review.id}
            </h1>
            <p className="text-gray-600">
              {review.patient?.firstName} {review.patient?.lastName}
            </p>
          </div>
        </div>

        {/* Workflow Progress */}
        <Card>
          <CardContent className="py-6">
            <WorkflowProgress currentStatus={review.status} />
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Workflow Info */}
          <div className="lg:col-span-1">
            <WorkflowInfoCard
              review={review}
              onStatusChange={handleStatusChange}
              loading={saving}
            />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full justify-start">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="data-entry">Data Entry</TabsTrigger>
                    <TabsTrigger value="interview">Interview</TabsTrigger>
                    <TabsTrigger value="medications">Medications</TabsTrigger>
                    <TabsTrigger value="report">Report</TabsTrigger>
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent value="overview" className="space-y-4">
                    <div className="prose max-w-none">
                      <h3 className="text-lg font-semibold">Review Overview</h3>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">
                            Referral Date:
                          </span>
                          <p>{review.referralDate || 'Not set'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">
                            Scheduled:
                          </span>
                          <p>{review.scheduledAt || 'Not scheduled'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">
                            Visit Location:
                          </span>
                          <p>{review.visitLocation || 'Not specified'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">
                            Follow-up Due:
                          </span>
                          <p>{review.followUpDueAt || 'Not set'}</p>
                        </div>
                      </div>

                      {review.referralReason && (
                        <div className="mt-4">
                          <span className="font-medium text-gray-700">
                            Referral Reason:
                          </span>
                          <p className="text-gray-600">
                            {review.referralReason}
                          </p>
                        </div>
                      )}

                      {review.referralNotes && (
                        <div className="mt-4">
                          <span className="font-medium text-gray-700">
                            Referral Notes:
                          </span>
                          <p className="text-gray-600 whitespace-pre-wrap">
                            {review.referralNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* Data Entry Tab */}
                  <TabsContent value="data-entry">
                    <DataEntryForm
                      review={review}
                      onSubmit={handleDataEntrySubmit}
                      loading={saving}
                    />
                  </TabsContent>

                  {/* Interview Tab */}
                  <TabsContent value="interview">
                    <InterviewForm
                      review={review}
                      onSubmit={handleInterviewSubmit}
                      loading={saving}
                    />
                  </TabsContent>

                  {/* Medications Tab */}
                  <TabsContent value="medications">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">
                        Current Medications
                      </h3>
                      {review.medications && review.medications.length > 0 ? (
                        <div className="space-y-3">
                          {review.medications.map((med) => (
                            <Card key={med.id} className="border">
                              <CardContent className="py-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h4 className="font-medium text-gray-900">
                                      {med.name}
                                    </h4>
                                    <div className="mt-1 text-sm text-gray-600 space-y-1">
                                      {med.dose && <p>Dose: {med.dose}</p>}
                                      {med.frequency && (
                                        <p>Frequency: {med.frequency}</p>
                                      )}
                                      {med.indication && (
                                        <p>Indication: {med.indication}</p>
                                      )}
                                      {med.notes && (
                                        <p className="text-gray-500">
                                          Notes: {med.notes}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">
                          No medications recorded yet. Add medications in the
                          Data Entry tab.
                        </p>
                      )}
                    </div>
                  </TabsContent>

                  {/* Report Tab */}
                  <TabsContent value="report">
                    <ReportForm
                      review={review}
                      onSubmit={handleReportSubmit}
                      loading={saving}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HmrReviewDetailPage
