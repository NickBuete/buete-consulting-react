import { Prisma } from '../generated/prisma'
import { withTenantContext } from '../db/tenant'
import type {
  PatientCreateInput,
  PatientUpdateInput,
} from '../validators/patientSchemas'

export type ListPatientsOptions = {
  search?: string
  clientId?: number
}

export const listPatients = async (
  ownerId: number,
  options: ListPatientsOptions = {}
) => {
  const conditions: Prisma.PatientWhereInput[] = []

  conditions.push({ ownerId })

  if (options.search) {
    conditions.push({
      OR: [
        { firstName: { contains: options.search, mode: 'insensitive' } },
        { lastName: { contains: options.search, mode: 'insensitive' } },
        { preferredName: { contains: options.search, mode: 'insensitive' } },
      ],
    })
  }

  if (typeof options.clientId === 'number') {
    conditions.push({ clientId: options.clientId })
  }

  const where: Prisma.PatientWhereInput = { AND: conditions }

  return withTenantContext(ownerId, (tx) =>
    tx.patient.findMany({
      where,
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      include: { client: true },
    })
  )
}

export const getPatientById = async (ownerId: number, id: number) => {
  return withTenantContext(ownerId, (tx) =>
    tx.patient.findFirst({
      where: { id, ownerId },
      include: {
        client: true,
        hmrReviews: {
          orderBy: { createdAt: 'desc' },
          include: { prescriber: true, clinic: true },
        },
      },
    })
  )
}

export const createPatient = async (
  ownerId: number,
  data: PatientCreateInput
) => {
  const createData: Prisma.PatientCreateInput = {
    firstName: data.firstName,
    lastName: data.lastName,
    preferredName: data.preferredName ?? null,
    dateOfBirth: data.dateOfBirth ?? null,
    contactEmail: data.contactEmail ?? null,
    contactPhone: data.contactPhone ?? null,
    addressLine1: data.addressLine1 ?? null,
    addressLine2: data.addressLine2 ?? null,
    suburb: data.suburb ?? null,
    state: data.state ?? null,
    postcode: data.postcode ?? null,
    emergencyContactName: data.emergencyContactName ?? null,
    emergencyContactPhone: data.emergencyContactPhone ?? null,
    medicareNumber: data.medicareNumber ?? null,
    livesAlone: data.livesAlone ?? null,
    livingArrangement: data.livingArrangement ?? null,
    usesWebster: data.usesWebster ?? null,
    otherSupports: data.otherSupports ?? null,
    notes: data.notes ?? null,
    owner: { connect: { id: ownerId } },
  }

  if (data.clientId) {
    createData.client = { connect: { id: data.clientId } }
  }

  return withTenantContext(ownerId, (tx) =>
    tx.patient.create({
      data: createData,
      include: { client: true },
    })
  )
}

export const updatePatient = async (
  ownerId: number,
  id: number,
  data: PatientUpdateInput
) => {
  const updatePayload: Prisma.PatientUpdateInput = {}

  if (typeof data.clientId !== 'undefined') {
    updatePayload.client = data.clientId
      ? { connect: { id: data.clientId } }
      : { disconnect: true }
  }
  if (typeof data.firstName !== 'undefined') {
    updatePayload.firstName = data.firstName
  }
  if (typeof data.lastName !== 'undefined') {
    updatePayload.lastName = data.lastName
  }
  if (typeof data.preferredName !== 'undefined') {
    updatePayload.preferredName = data.preferredName ?? null
  }
  if (typeof data.dateOfBirth !== 'undefined') {
    updatePayload.dateOfBirth = data.dateOfBirth ?? null
  }
  if (typeof data.contactEmail !== 'undefined') {
    updatePayload.contactEmail = data.contactEmail ?? null
  }
  if (typeof data.contactPhone !== 'undefined') {
    updatePayload.contactPhone = data.contactPhone ?? null
  }
  if (typeof data.addressLine1 !== 'undefined') {
    updatePayload.addressLine1 = data.addressLine1 ?? null
  }
  if (typeof data.addressLine2 !== 'undefined') {
    updatePayload.addressLine2 = data.addressLine2 ?? null
  }
  if (typeof data.suburb !== 'undefined') {
    updatePayload.suburb = data.suburb ?? null
  }
  if (typeof data.state !== 'undefined') {
    updatePayload.state = data.state ?? null
  }
  if (typeof data.postcode !== 'undefined') {
    updatePayload.postcode = data.postcode ?? null
  }
  if (typeof data.emergencyContactName !== 'undefined') {
    updatePayload.emergencyContactName = data.emergencyContactName ?? null
  }
  if (typeof data.emergencyContactPhone !== 'undefined') {
    updatePayload.emergencyContactPhone = data.emergencyContactPhone ?? null
  }
  if (typeof data.medicareNumber !== 'undefined') {
    updatePayload.medicareNumber = data.medicareNumber ?? null
  }
  if (typeof data.livesAlone !== 'undefined') {
    updatePayload.livesAlone = data.livesAlone ?? null
  }
  if (typeof data.livingArrangement !== 'undefined') {
    updatePayload.livingArrangement = data.livingArrangement ?? null
  }
  if (typeof data.usesWebster !== 'undefined') {
    updatePayload.usesWebster = data.usesWebster ?? null
  }
  if (typeof data.otherSupports !== 'undefined') {
    updatePayload.otherSupports = data.otherSupports ?? null
  }
  if (typeof data.notes !== 'undefined') {
    updatePayload.notes = data.notes ?? null
  }

  return withTenantContext(ownerId, async (tx) => {
    const existing = await tx.patient.findFirst({ where: { id, ownerId } })
    if (!existing) {
      return null
    }

    return tx.patient.update({
      where: { id },
      data: updatePayload,
      include: { client: true },
    })
  })
}

export const deletePatient = async (ownerId: number, id: number) => {
  return withTenantContext(ownerId, async (tx) => {
    const deleted = await tx.patient.deleteMany({ where: { id, ownerId } })
    return deleted.count > 0
  })
}
