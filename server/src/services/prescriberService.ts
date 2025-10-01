import { Prisma } from '../generated/prisma'
import { prisma } from '../db/prisma'
import type {
  PrescriberCreateInput,
  PrescriberUpdateInput,
} from '../validators/prescriberSchemas'
import type { ClinicCreateInput } from '../validators/clinicSchemas'

const buildClinicCreateRelation = (
  clinic: ClinicCreateInput
): Prisma.ClinicCreateNestedOneWithoutPrescribersInput => ({
  create: {
    name: clinic.name,
    contactEmail: clinic.contactEmail ?? null,
    contactPhone: clinic.contactPhone ?? null,
    addressLine1: clinic.addressLine1 ?? null,
    addressLine2: clinic.addressLine2 ?? null,
    suburb: clinic.suburb ?? null,
    state: clinic.state ?? null,
    postcode: clinic.postcode ?? null,
    notes: clinic.notes ?? null,
  },
})

// Prescribers are now SHARED resources - no tenant isolation
export const listPrescribers = async () => {
  return prisma.prescriber.findMany({
    orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    include: { clinic: true },
  })
}

export const getPrescriberById = async (id: number) => {
  return prisma.prescriber.findUnique({
    where: { id },
    include: { clinic: true, hmrReviews: true },
  })
}

export const createPrescriber = async (data: PrescriberCreateInput) => {
  const createData: Prisma.PrescriberCreateInput = {
    honorific: data.honorific ?? null,
    firstName: data.firstName,
    lastName: data.lastName,
    providerNumber: data.providerNumber ?? null,
    contactEmail: data.contactEmail ?? null,
    contactPhone: data.contactPhone ?? null,
    notes: data.notes ?? null,
  }

  if (data.clinicId) {
    const clinic = await prisma.clinic.findUnique({
      where: { id: data.clinicId },
    })
    if (!clinic) {
      return null
    }
    createData.clinic = { connect: { id: clinic.id } }
  } else if (data.clinic) {
    createData.clinic = buildClinicCreateRelation(data.clinic)
  }

  return prisma.prescriber.create({
    data: createData,
    include: { clinic: true },
  })
}

export const updatePrescriber = async (
  id: number,
  data: PrescriberUpdateInput
) => {
  const updatePayload: Prisma.PrescriberUpdateInput = {}

  if (typeof data.honorific !== 'undefined') {
    updatePayload.honorific = data.honorific ?? null
  }
  if (typeof data.firstName !== 'undefined') {
    updatePayload.firstName = data.firstName
  }
  if (typeof data.lastName !== 'undefined') {
    updatePayload.lastName = data.lastName
  }
  if (typeof data.providerNumber !== 'undefined') {
    updatePayload.providerNumber = data.providerNumber ?? null
  }
  if (typeof data.contactEmail !== 'undefined') {
    updatePayload.contactEmail = data.contactEmail ?? null
  }
  if (typeof data.contactPhone !== 'undefined') {
    updatePayload.contactPhone = data.contactPhone ?? null
  }
  if (typeof data.notes !== 'undefined') {
    updatePayload.notes = data.notes ?? null
  }

  const existing = await prisma.prescriber.findUnique({ where: { id } })
  if (!existing) {
    return null
  }

  if (typeof data.clinicId !== 'undefined') {
    if (data.clinicId) {
      const clinic = await prisma.clinic.findUnique({
        where: { id: data.clinicId },
      })
      if (!clinic) {
        return null
      }
      updatePayload.clinic = { connect: { id: clinic.id } }
    } else {
      updatePayload.clinic = { disconnect: true }
    }
  } else if (typeof data.clinic !== 'undefined') {
    if (data.clinic) {
      updatePayload.clinic = buildClinicCreateRelation(data.clinic)
    } else {
      updatePayload.clinic = { disconnect: true }
    }
  }

  return prisma.prescriber.update({
    where: { id },
    data: updatePayload,
    include: { clinic: true },
  })
}

export const deletePrescriber = async (id: number) => {
  const deleted = await prisma.prescriber
    .delete({ where: { id } })
    .catch(() => null)
  return deleted !== null
}
