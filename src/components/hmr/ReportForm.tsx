import React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Alert,
  AlertDescription,
} from '../ui'
import { TipTapEditor } from '../editor/TipTapEditor'
import {
  generateReportTemplate,
  generateAISuggestions,
  generateKeySummary,
} from '../editor/reportGenerator'
import {
  generateAIRecommendations,
  generateAIAssessmentSummary,
} from '../../services/ai'
import type { HmrReview } from '../../types/hmr'
import {
  FileText,
  Sparkles,
  Save,
  Send,
  Eye,
  Lightbulb,
  Download,
  AlertCircle,
  Wand2,
} from 'lucide-react'

interface ReportFormProps {
  review: HmrReview
  onSubmit: (data: Partial<HmrReview>) => Promise<void>
  loading?: boolean
}

export const ReportForm: React.FC<ReportFormProps> = ({
  review,
  onSubmit,
  loading = false,
}) => {
  const [reportContent, setReportContent] = React.useState<string>('')
  const [showSuggestions, setShowSuggestions] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [mode, setMode] = React.useState<'edit' | 'preview'>('edit')

  // Initialize report content
  React.useEffect(() => {
    if (review.reportContent) {
      setReportContent(review.reportContent)
    } else {
      // Generate initial template if no report exists
      const template = generateReportTemplate(review)
      setReportContent(template)
    }
  }, [review])

  const handleGenerateTemplate = () => {
    const template = generateReportTemplate(review)
    setReportContent(template)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSubmit({ reportContent })
    } finally {
      setSaving(false)
    }
  }

  const handleFinalize = async () => {
    setSaving(true)
    try {
      await onSubmit({
        reportContent,
        status: 'REPORT_READY',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleGenerateAIRecommendations = async () => {
    setSaving(true)
    try {
      const recommendations = await generateAIRecommendations(review.id)

      // Insert recommendations into the report at the recommendations section
      const recommendationsSection = `<h2>Pharmacist Recommendations</h2>\n${recommendations}`

      // Replace the placeholder recommendations section
      const updatedContent = reportContent.replace(
        /<h2>Pharmacist Recommendations<\/h2>[\s\S]*?<h2>Medication Action Plan<\/h2>/,
        `${recommendationsSection}\n\n<h2>Medication Action Plan</h2>`
      )

      setReportContent(updatedContent)
      alert('AI recommendations generated successfully')
    } catch (error) {
      console.error('Failed to generate AI recommendations:', error)
      alert(
        'Failed to generate AI recommendations. Please check your AWS configuration.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleGenerateAISummary = async () => {
    setSaving(true)
    try {
      const summary = await generateAIAssessmentSummary(review.id)

      // Insert summary into the assessment section
      const summarySection = `<h3>Overall Assessment</h3>\n<p>${summary}</p>`

      // Replace the assessment summary placeholder
      const updatedContent = reportContent.replace(
        /<h3>Overall Assessment<\/h3>[\s\S]*?(?=<h3>|<h2>)/,
        `${summarySection}\n\n`
      )

      setReportContent(updatedContent)
      alert('AI assessment summary generated successfully')
    } catch (error) {
      console.error('Failed to generate AI summary:', error)
      alert(
        'Failed to generate AI summary. Please check your AWS configuration.'
      )
    } finally {
      setSaving(false)
    }
  }

  const suggestions = React.useMemo(
    () => generateAISuggestions(review),
    [review]
  )
  const keySummary = React.useMemo(() => generateKeySummary(review), [review])

  const canEdit = ['INTERVIEW', 'REPORT_DRAFT'].includes(review.status)
  const isDraft = review.status === 'REPORT_DRAFT'

  return (
    <div className="space-y-6">
      {/* Status Alert */}
      {!canEdit && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            The report is in read-only mode. Status must be "Interview" or
            "Report Draft" to edit.
          </AlertDescription>
        </Alert>
      )}

      {/* Header Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                HMR Report
              </CardTitle>
              <CardDescription>
                {isDraft
                  ? 'Continue editing your report draft'
                  : 'Create a comprehensive Home Medicines Review report'}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {canEdit && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateTemplate}
                    className="gap-2"
                    disabled={saving || loading}
                  >
                    <Sparkles className="h-4 w-4" />
                    Regenerate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setMode(mode === 'edit' ? 'preview' : 'edit')
                    }
                    className="gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    {mode === 'edit' ? 'Preview' : 'Edit'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {canEdit && (
              <>
                <Button
                  onClick={handleSave}
                  disabled={saving || loading}
                  className="gap-2"
                  variant="outline"
                >
                  <Save className="h-4 w-4" />
                  Save Draft
                </Button>
                <Button
                  onClick={handleFinalize}
                  disabled={saving || loading}
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  Finalize Report
                </Button>
                <Button
                  onClick={handleGenerateAIRecommendations}
                  disabled={saving || loading}
                  className="gap-2"
                  variant="outline"
                >
                  <Wand2 className="h-4 w-4" />
                  AI Recommendations
                </Button>
                <Button
                  onClick={handleGenerateAISummary}
                  disabled={saving || loading}
                  className="gap-2"
                  variant="outline"
                >
                  <Sparkles className="h-4 w-4" />
                  AI Summary
                </Button>
              </>
            )}
            <Button variant="outline" className="gap-2" disabled>
              <Download className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Suggestions Panel */}
      {showSuggestions && suggestions.length > 0 && canEdit && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-blue-600" />
                AI-Powered Suggestions
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSuggestions(false)}
                className="h-6 px-2 text-xs"
              >
                Hide
              </Button>
            </div>
            <CardDescription>
              Consider these points when reviewing the patient's medications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="flex gap-2 text-sm">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Key Summary */}
      {keySummary && canEdit && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Key Summary</CardTitle>
            <CardDescription>
              Quick overview of the patient's situation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="text-sm text-gray-700 whitespace-pre-line font-sans">
              {keySummary}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Editor */}
      <Card>
        <CardContent className="pt-6">
          <TipTapEditor
            content={reportContent}
            onChange={setReportContent}
            placeholder="Start writing the HMR report..."
            editable={canEdit && mode === 'edit'}
            className="min-h-[600px]"
          />
        </CardContent>
      </Card>

      {/* Patient Information Reference */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-sm">Patient Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Name:</span>
              <p>
                {review.patient?.firstName} {review.patient?.lastName}
              </p>
            </div>
            <div>
              <span className="font-medium text-gray-700">DOB:</span>
              <p>{review.patient?.dateOfBirth || 'Not recorded'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Medicare:</span>
              <p>{review.patient?.medicareNumber || 'Not recorded'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Phone:</span>
              <p>{review.patient?.contactPhone || 'Not recorded'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer Actions */}
      {canEdit && (
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={saving || loading}
          >
            Save Draft
          </Button>
          <Button onClick={handleFinalize} disabled={saving || loading}>
            Finalize Report
          </Button>
        </div>
      )}
    </div>
  )
}
