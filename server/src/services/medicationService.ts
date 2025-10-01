import { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';
import type {
  MedicationCreateInput,
  MedicationUpdateInput,
} from '../validators/medicationSchemas';

export const listMedications = async () => {
  return prisma.medication.findMany({ orderBy: { name: 'asc' } });
};

export const getMedicationById = async (id: number) => {
  return prisma.medication.findUnique({
    where: { id },
    include: { hmrEntries: true },
  });
};

export const createMedication = async (data: MedicationCreateInput) => {
  return prisma.medication.create({
    data: {
      name: data.name,
      form: data.form ?? null,
      strength: data.strength ?? null,
      route: data.route ?? null,
      notes: data.notes ?? null,
    },
  });
};

export const updateMedication = async (id: number, data: MedicationUpdateInput) => {
  const updatePayload: Prisma.MedicationUpdateInput = {};

  if (typeof data.name !== 'undefined') {
    updatePayload.name = data.name;
  }
  if (typeof data.form !== 'undefined') {
    updatePayload.form = data.form ?? null;
  }
  if (typeof data.strength !== 'undefined') {
    updatePayload.strength = data.strength ?? null;
  }
  if (typeof data.route !== 'undefined') {
    updatePayload.route = data.route ?? null;
  }
  if (typeof data.notes !== 'undefined') {
    updatePayload.notes = data.notes ?? null;
  }

  return prisma.medication.update({
    where: { id },
    data: updatePayload,
  });
};

export const deleteMedication = async (id: number) => {
  await prisma.medication.delete({ where: { id } });
};
