import { Prisma } from '@prisma/client'
import { prisma } from '../db/prisma'
import { getCached, invalidateCache } from '../utils/cache'
import type {
  ClinicCreateInput,
  ClinicUpdateInput,
} from '../validators/clinicSchemas'

// Clinics are now SHARED resources - no tenant isolation
export const listClinics = async () => {
  return getCached('clinics:list', async () => {
    return prisma.clinic.findMany({
      orderBy: { name: 'asc' },
      include: { prescribers: true },
    })
  })
}

export const getClinicById = async (id: number) => {
  return getCached(`clinics:${id}`, async () => {
    return prisma.clinic.findUnique({
      where: { id },
      include: { prescribers: true },
    })
  })
}

export const createClinic = async (data: ClinicCreateInput) => {
  const createData: Prisma.ClinicCreateInput = {
    name: data.name,
    contactEmail: data.contactEmail ?? null,
    contactPhone: data.contactPhone ?? null,
    addressLine1: data.addressLine1 ?? null,
    addressLine2: data.addressLine2 ?? null,
    suburb: data.suburb ?? null,
    state: data.state ?? null,
    postcode: data.postcode ?? null,
    notes: data.notes ?? null,
  }

  const clinic = await prisma.clinic.create({ data: createData })
  invalidateCache('clinics:')
  return clinic
}

export const updateClinic = async (id: number, data: ClinicUpdateInput) => {
  const updatePayload: Prisma.ClinicUpdateInput = {}

  if (typeof data.name !== 'undefined') {
    updatePayload.name = data.name
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
  if (typeof data.notes !== 'undefined') {
    updatePayload.notes = data.notes ?? null
  }

  const existing = await prisma.clinic.findUnique({ where: { id } })
  if (!existing) {
    return null
  }

  const clinic = await prisma.clinic.update({
    where: { id },
    data: updatePayload,
  })

  invalidateCache('clinics:')
  return clinic
}

export const deleteClinic = async (id: number) => {
  const deleted = await prisma.clinic
    .delete({ where: { id } })
    .catch(() => null)

  if (deleted) {
    invalidateCache('clinics:')
  }

  return deleted !== null
}
