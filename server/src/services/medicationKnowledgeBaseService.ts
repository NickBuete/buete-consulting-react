import { prisma } from '../db/prisma'

export interface MedicationSearchResult {
  id: number
  name: string
  genericName: string | null
  form: string | null
  strength: string | null
  route: string | null
  usageCount: number
  indications: {
    id: number
    indication: string
    usageCount: number
  }[]
}

export interface CreateMedicationKnowledgeBaseInput {
  name: string
  genericName?: string
  form?: string
  strength?: string
  route?: string
  indication?: string
  notes?: string
}

/**
 * Search medications in the knowledge base
 * Supports fuzzy search by name, generic name, or indication
 */
export const searchMedications = async (
  query: string,
  limit: number = 20
): Promise<MedicationSearchResult[]> => {
  const medications = await prisma.medication.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { genericName: { contains: query, mode: 'insensitive' } },
        {
          indications: {
            some: {
              indication: { contains: query, mode: 'insensitive' },
            },
          },
        },
      ],
      isActive: true,
    },
    include: {
      indications: {
        orderBy: {
          usageCount: 'desc', // Most used indications first
        },
      },
    },
    orderBy: [
      { usageCount: 'desc' }, // Most used medications first
      { name: 'asc' },
    ],
    take: limit,
  })

  return medications.map((med) => ({
    id: med.id,
    name: med.name,
    genericName: med.genericName,
    form: med.form,
    strength: med.strength,
    route: med.route,
    usageCount: med.usageCount,
    indications: med.indications.map((ind) => ({
      id: ind.id,
      indication: ind.indication,
      usageCount: ind.usageCount,
    })),
  }))
}

/**
 * Get medication by ID with all indications
 */
export const getMedicationById = async (
  id: number
): Promise<MedicationSearchResult | null> => {
  const medication = await prisma.medication.findUnique({
    where: { id },
    include: {
      indications: {
        orderBy: {
          usageCount: 'desc',
        },
      },
    },
  })

  if (!medication) return null

  return {
    id: medication.id,
    name: medication.name,
    genericName: medication.genericName,
    form: medication.form,
    strength: medication.strength,
    route: medication.route,
    usageCount: medication.usageCount,
    indications: medication.indications.map((ind) => ({
      id: ind.id,
      indication: ind.indication,
      usageCount: ind.usageCount,
    })),
  }
}

/**
 * Create or update medication in knowledge base
 * If medication exists, increment usage count
 * If indication is new, add it to the medication
 */
export const upsertMedicationKnowledgeBase = async (
  input: CreateMedicationKnowledgeBaseInput
): Promise<MedicationSearchResult> => {
  const { name, genericName, form, strength, route, indication, notes } = input

  // Try to find existing medication by name, strength, and form
  let medication = await prisma.medication.findFirst({
    where: {
      name: {
        equals: name,
        mode: 'insensitive',
      },
      strength: strength || null,
      form: form || null,
    },
    include: {
      indications: true,
    },
  })

  if (medication) {
    // Update existing medication - increment usage count
    medication = await prisma.medication.update({
      where: { id: medication.id },
      data: {
        usageCount: { increment: 1 },
        // Update fields if provided and different
        ...(genericName && genericName !== medication.genericName
          ? { genericName }
          : {}),
        ...(route && route !== medication.route ? { route } : {}),
        ...(notes && notes !== medication.notes ? { notes } : {}),
      },
      include: {
        indications: true,
      },
    })

    // Add indication if provided and doesn't exist
    if (indication) {
      const existingIndication = medication.indications.find(
        (ind) => ind.indication.toLowerCase() === indication.toLowerCase()
      )

      if (existingIndication) {
        // Increment usage count for existing indication
        await prisma.medicationIndication.update({
          where: { id: existingIndication.id },
          data: { usageCount: { increment: 1 } },
        })
      } else {
        // Create new indication
        await prisma.medicationIndication.create({
          data: {
            medicationId: medication.id,
            indication,
            usageCount: 1,
          },
        })
      }

      // Re-fetch to get updated indications
      medication = await prisma.medication.findUniqueOrThrow({
        where: { id: medication.id },
        include: {
          indications: {
            orderBy: { usageCount: 'desc' },
          },
        },
      })
    }
  } else {
    // Create new medication
    const createData: any = {
      name,
      genericName: genericName || null,
      form: form || null,
      strength: strength || null,
      route: route || null,
      notes: notes || null,
      usageCount: 1,
    };

    if (indication) {
      createData.indications = {
        create: {
          indication,
          usageCount: 1,
        },
      };
    }

    medication = await prisma.medication.create({
      data: createData,
      include: {
        indications: true,
      },
    })
  }

  return {
    id: medication.id,
    name: medication.name,
    genericName: medication.genericName,
    form: medication.form,
    strength: medication.strength,
    route: medication.route,
    usageCount: medication.usageCount,
    indications: medication.indications.map((ind) => ({
      id: ind.id,
      indication: ind.indication,
      usageCount: ind.usageCount,
    })),
  }
}

/**
 * Get popular medications (most frequently used)
 */
export const getPopularMedications = async (
  limit: number = 50
): Promise<MedicationSearchResult[]> => {
  const medications = await prisma.medication.findMany({
    where: {
      isActive: true,
    },
    include: {
      indications: {
        orderBy: {
          usageCount: 'desc',
        },
      },
    },
    orderBy: {
      usageCount: 'desc',
    },
    take: limit,
  })

  return medications.map((med) => ({
    id: med.id,
    name: med.name,
    genericName: med.genericName,
    form: med.form,
    strength: med.strength,
    route: med.route,
    usageCount: med.usageCount,
    indications: med.indications.map((ind) => ({
      id: ind.id,
      indication: ind.indication,
      usageCount: ind.usageCount,
    })),
  }))
}

/**
 * Search indications by query
 * Useful for autocomplete
 */
export const searchIndications = async (
  query: string,
  limit: number = 20
): Promise<string[]> => {
  const indications = await prisma.medicationIndication.findMany({
    where: {
      indication: {
        contains: query,
        mode: 'insensitive',
      },
    },
    select: {
      indication: true,
    },
    orderBy: {
      usageCount: 'desc',
    },
    take: limit,
    distinct: ['indication'],
  })

  return indications.map((ind) => ind.indication)
}

/**
 * Deactivate a medication (soft delete)
 */
export const deactivateMedication = async (id: number): Promise<void> => {
  await prisma.medication.update({
    where: { id },
    data: { isActive: false },
  })
}
