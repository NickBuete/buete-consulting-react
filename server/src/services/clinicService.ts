import { Prisma } from '../generated/prisma';
import { withTenantContext } from '../db/tenant';
import type { ClinicCreateInput, ClinicUpdateInput } from '../validators/clinicSchemas';

export const listClinics = async (ownerId: number) => {
  return withTenantContext(ownerId, (tx) =>
    tx.clinic.findMany({
      where: { ownerId },
      orderBy: { name: 'asc' },
    }),
  );
};

export const getClinicById = async (ownerId: number, id: number) => {
  return withTenantContext(ownerId, (tx) =>
    tx.clinic.findFirst({
      where: { id, ownerId },
      include: { prescribers: true },
    }),
  );
};

export const createClinic = async (ownerId: number, data: ClinicCreateInput) => {
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
  };

  createData.owner = { connect: { id: ownerId } };

  return withTenantContext(ownerId, (tx) => tx.clinic.create({ data: createData }));
};

export const updateClinic = async (ownerId: number, id: number, data: ClinicUpdateInput) => {
  const updatePayload: Prisma.ClinicUpdateInput = {};

  if (typeof data.name !== 'undefined') {
    updatePayload.name = data.name;
  }
  if (typeof data.contactEmail !== 'undefined') {
    updatePayload.contactEmail = data.contactEmail ?? null;
  }
  if (typeof data.contactPhone !== 'undefined') {
    updatePayload.contactPhone = data.contactPhone ?? null;
  }
  if (typeof data.addressLine1 !== 'undefined') {
    updatePayload.addressLine1 = data.addressLine1 ?? null;
  }
  if (typeof data.addressLine2 !== 'undefined') {
    updatePayload.addressLine2 = data.addressLine2 ?? null;
  }
  if (typeof data.suburb !== 'undefined') {
    updatePayload.suburb = data.suburb ?? null;
  }
  if (typeof data.state !== 'undefined') {
    updatePayload.state = data.state ?? null;
  }
  if (typeof data.postcode !== 'undefined') {
    updatePayload.postcode = data.postcode ?? null;
  }
  if (typeof data.notes !== 'undefined') {
    updatePayload.notes = data.notes ?? null;
  }

  return withTenantContext(ownerId, async (tx) => {
    const existing = await tx.clinic.findFirst({ where: { id, ownerId } });
    if (!existing) {
      return null;
    }

    return tx.clinic.update({
      where: { id },
      data: updatePayload,
    });
  });
};

export const deleteClinic = async (ownerId: number, id: number) => {
  return withTenantContext(ownerId, async (tx) => {
    const deleted = await tx.clinic.deleteMany({ where: { id, ownerId } });
    return deleted.count > 0;
  });
};
