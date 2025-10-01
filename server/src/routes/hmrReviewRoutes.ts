import type { Response } from 'express'
import { Router } from 'express'
import { Prisma, HmrReviewStatus, SymptomType } from '../generated/prisma'

import {
  addMedicationToReview,
  createActionItemForReview,
  createAttachmentForReview,
  createHmrReview,
  deleteActionItemFromReview,
  deleteHmrReview,
  deleteSymptomFromReview,
  getHmrReviewById,
  listHmrReviews,
  recordAuditLog,
  removeMedicationFromReview,
  updateActionItemForReview,
  updateHmrReview,
  updateMedicationForReview,
  upsertSymptomForReview,
  type ListHmrReviewsOptions,
} from '../services/hmrReviewService'
import { InvalidTransitionError } from '../utils/workflowValidation'
import { asyncHandler } from './utils/asyncHandler'
import {
  hmrActionItemCreateSchema,
  hmrActionItemUpdateSchema,
  hmrAttachmentCreateSchema,
  hmrAuditLogCreateSchema,
  hmrMedicationCreateSchema,
  hmrMedicationUpdateSchema,
  hmrReviewCreateSchema,
  hmrReviewUpdateSchema,
  hmrSymptomUpsertSchema,
} from '../validators/hmrReviewSchemas'

const router = Router()

const parseId = (value: string | undefined) => {
  if (!value) {
    return null
  }
  const id = Number.parseInt(value, 10)
  if (Number.isNaN(id)) {
    return null
  }
  return id
}

const handlePrismaError = (error: unknown, res: Response) => {
  // Handle workflow validation errors
  if (error instanceof InvalidTransitionError) {
    return res.status(422).json({
      message: error.message,
      currentStatus: error.currentStatus,
      attemptedStatus: error.attemptedStatus,
    })
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'Duplicate record detected' })
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Record not found' })
    }
  }

  throw error
}

router.get(
  '/reviews',
  asyncHandler(async (req, res) => {
    const statusParam =
      typeof req.query.status === 'string' ? req.query.status : undefined
    const status =
      statusParam &&
      (Object.values(HmrReviewStatus) as string[]).includes(statusParam)
        ? (statusParam as HmrReviewStatus)
        : undefined

    const patientId = parseId(
      typeof req.query.patientId === 'string' ? req.query.patientId : undefined
    )
    const clinicId = parseId(
      typeof req.query.clinicId === 'string' ? req.query.clinicId : undefined
    )
    const prescriberId = parseId(
      typeof req.query.prescriberId === 'string'
        ? req.query.prescriberId
        : undefined
    )
    const includeCompleted = req.query.includeCompleted === 'true'
    const search =
      typeof req.query.search === 'string' ? req.query.search : undefined

    const options: ListHmrReviewsOptions = {}
    if (status) {
      options.status = status
    }
    if (patientId !== null) {
      options.patientId = patientId
    }
    if (clinicId !== null) {
      options.clinicId = clinicId
    }
    if (prescriberId !== null) {
      options.prescriberId = prescriberId
    }
    if (includeCompleted) {
      options.includeCompleted = true
    }
    if (search) {
      options.search = search
    }

    const ownerId = req.user!.id
    const reviews = await listHmrReviews(ownerId, options)

    res.json(reviews)
  })
)

router.post(
  '/reviews',
  asyncHandler(async (req, res) => {
    const payload = hmrReviewCreateSchema.parse(req.body)

    try {
      const ownerId = req.user!.id
      const review = await createHmrReview(ownerId, payload)
      if (!review) {
        return res.status(404).json({ message: 'Related record not found' })
      }

      res.status(201).json(review)
    } catch (error) {
      return handlePrismaError(error, res)
    }
  })
)

router.get(
  '/reviews/:id',
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id)
    if (id === null) {
      return res.status(400).json({ message: 'Invalid review id' })
    }

    const ownerId = req.user!.id
    const review = await getHmrReviewById(ownerId, id)
    if (!review) {
      return res.status(404).json({ message: 'Review not found' })
    }

    res.json(review)
  })
)

router.patch(
  '/reviews/:id',
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id)
    if (id === null) {
      return res.status(400).json({ message: 'Invalid review id' })
    }

    const payload = hmrReviewUpdateSchema.parse(req.body)

    try {
      const ownerId = req.user!.id
      const review = await updateHmrReview(ownerId, id, payload)
      if (!review) {
        return res.status(404).json({ message: 'Review not found' })
      }

      res.json(review)
    } catch (error) {
      return handlePrismaError(error, res)
    }
  })
)

router.delete(
  '/reviews/:id',
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id)
    if (id === null) {
      return res.status(400).json({ message: 'Invalid review id' })
    }

    try {
      const ownerId = req.user!.id
      const deleted = await deleteHmrReview(ownerId, id)
      if (!deleted) {
        return res.status(404).json({ message: 'Review not found' })
      }

      res.status(204).send()
    } catch (error) {
      return handlePrismaError(error, res)
    }
  })
)

router.post(
  '/reviews/:id/medications',
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id)
    if (id === null) {
      return res.status(400).json({ message: 'Invalid review id' })
    }

    const payload = hmrMedicationCreateSchema.parse(req.body)

    try {
      const ownerId = req.user!.id
      const medication = await addMedicationToReview(ownerId, id, payload)
      if (!medication) {
        return res.status(404).json({ message: 'Review not found' })
      }

      res.status(201).json(medication)
    } catch (error) {
      return handlePrismaError(error, res)
    }
  })
)

router.patch(
  '/reviews/:id/medications/:medicationId',
  asyncHandler(async (req, res) => {
    const medicationId = parseId(req.params.medicationId)
    if (medicationId === null) {
      return res.status(400).json({ message: 'Invalid medication id' })
    }

    const payload = hmrMedicationUpdateSchema.parse(req.body)

    try {
      const ownerId = req.user!.id
      const medication = await updateMedicationForReview(
        ownerId,
        medicationId,
        payload
      )
      if (!medication) {
        return res.status(404).json({ message: 'Medication not found' })
      }

      res.json(medication)
    } catch (error) {
      return handlePrismaError(error, res)
    }
  })
)

router.delete(
  '/reviews/:id/medications/:medicationId',
  asyncHandler(async (req, res) => {
    const medicationId = parseId(req.params.medicationId)
    if (medicationId === null) {
      return res.status(400).json({ message: 'Invalid medication id' })
    }

    try {
      const ownerId = req.user!.id
      const deleted = await removeMedicationFromReview(ownerId, medicationId)
      if (!deleted) {
        return res.status(404).json({ message: 'Medication not found' })
      }

      res.status(204).send()
    } catch (error) {
      return handlePrismaError(error, res)
    }
  })
)

router.post(
  '/reviews/:id/symptoms',
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id)
    if (id === null) {
      return res.status(400).json({ message: 'Invalid review id' })
    }

    const payload = hmrSymptomUpsertSchema.parse(req.body)

    try {
      const ownerId = req.user!.id
      const symptom = await upsertSymptomForReview(ownerId, id, payload)
      if (!symptom) {
        return res.status(404).json({ message: 'Review not found' })
      }

      res.status(201).json(symptom)
    } catch (error) {
      return handlePrismaError(error, res)
    }
  })
)

router.delete(
  '/reviews/:id/symptoms/:symptom',
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id)
    if (id === null) {
      return res.status(400).json({ message: 'Invalid review id' })
    }

    const symptomKey = req.params.symptom?.toUpperCase()
    const symptom =
      symptomKey &&
      (SymptomType as Record<string, SymptomType>)[
        symptomKey as keyof typeof SymptomType
      ]

    if (!symptom) {
      return res.status(400).json({ message: 'Invalid symptom' })
    }

    try {
      const ownerId = req.user!.id
      const deleted = await deleteSymptomFromReview(ownerId, id, symptom)
      if (!deleted) {
        return res.status(404).json({ message: 'Symptom not found' })
      }

      res.status(204).send()
    } catch (error) {
      return handlePrismaError(error, res)
    }
  })
)

router.post(
  '/reviews/:id/action-items',
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id)
    if (id === null) {
      return res.status(400).json({ message: 'Invalid review id' })
    }

    const payload = hmrActionItemCreateSchema.parse(req.body)

    try {
      const ownerId = req.user!.id
      const actionItem = await createActionItemForReview(ownerId, id, payload)
      if (!actionItem) {
        return res.status(404).json({ message: 'Review not found' })
      }

      res.status(201).json(actionItem)
    } catch (error) {
      return handlePrismaError(error, res)
    }
  })
)

router.patch(
  '/reviews/:id/action-items/:actionItemId',
  asyncHandler(async (req, res) => {
    const actionItemId = parseId(req.params.actionItemId)
    if (actionItemId === null) {
      return res.status(400).json({ message: 'Invalid action item id' })
    }

    const payload = hmrActionItemUpdateSchema.parse(req.body)

    try {
      const ownerId = req.user!.id
      const actionItem = await updateActionItemForReview(
        ownerId,
        actionItemId,
        payload
      )
      if (!actionItem) {
        return res.status(404).json({ message: 'Action item not found' })
      }

      res.json(actionItem)
    } catch (error) {
      return handlePrismaError(error, res)
    }
  })
)

router.delete(
  '/reviews/:id/action-items/:actionItemId',
  asyncHandler(async (req, res) => {
    const actionItemId = parseId(req.params.actionItemId)
    if (actionItemId === null) {
      return res.status(400).json({ message: 'Invalid action item id' })
    }

    try {
      const ownerId = req.user!.id
      const deleted = await deleteActionItemFromReview(ownerId, actionItemId)
      if (!deleted) {
        return res.status(404).json({ message: 'Action item not found' })
      }

      res.status(204).send()
    } catch (error) {
      return handlePrismaError(error, res)
    }
  })
)

router.post(
  '/reviews/:id/attachments',
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id)
    if (id === null) {
      return res.status(400).json({ message: 'Invalid review id' })
    }

    const payload = hmrAttachmentCreateSchema.parse(req.body)

    try {
      const ownerId = req.user!.id
      const attachment = await createAttachmentForReview(ownerId, id, payload)
      if (!attachment) {
        return res.status(404).json({ message: 'Review not found' })
      }

      res.status(201).json(attachment)
    } catch (error) {
      return handlePrismaError(error, res)
    }
  })
)

router.post(
  '/reviews/:id/audit',
  asyncHandler(async (req, res) => {
    const id = parseId(req.params.id)
    if (id === null) {
      return res.status(400).json({ message: 'Invalid review id' })
    }

    const payload = hmrAuditLogCreateSchema.parse(req.body)

    try {
      const ownerId = req.user!.id
      const auditLog = await recordAuditLog(ownerId, id, payload)
      if (!auditLog) {
        return res.status(404).json({ message: 'Review not found' })
      }

      res.status(201).json(auditLog)
    } catch (error) {
      return handlePrismaError(error, res)
    }
  })
)

export const hmrReviewRouter = router
