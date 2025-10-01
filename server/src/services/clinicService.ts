import { Prisma } from '../generated/prisma'
import { prisma } from '../db/prisma'
import type {
  ClinicCreateInput,
  ClinicUpdateInput,
} from '../validators/clinicSchemas'

// Clinics are now SHARED resources - no tenant isolation
export const listClinics = async () => {
  return prisma.clinic.findMany({
    orderBy: { name: 'asc' },
    include: { prescribers: true },
  })
}

export const getClinicById = async (id: number) => {
  return prisma.clinic.findUnique({
    where: { id },
    include: { prescribers: true },
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

  return prisma.clinic.create({ data: createData })
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

  return prisma.clinic.update({
    where: { id },
    data: updatePayload,
  })
}

export const deleteClinic = async (id: number) => {
  const deleted = await prisma.clinic
    .delete({ where: { id } })
    .catch(() => null)
  return deleted !== null
}
