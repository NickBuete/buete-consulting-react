import { Prisma } from '../generated/prisma';
import { withTenantContext } from '../db/tenant';
import type {
  PrescriberCreateInput,
  PrescriberUpdateInput,
} from '../validators/prescriberSchemas';
import type { ClinicCreateInput } from '../validators/clinicSchemas';

const buildClinicCreateRelation = (
  ownerId: number,
  clinic: ClinicCreateInput,
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
    owner: { connect: { id: ownerId } },
  },
});

export const listPrescribers = async (ownerId: number) => {
  return withTenantContext(ownerId, (tx) =>
    tx.prescriber.findMany({
      where: { ownerId },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
      include: { clinic: true },
    }),
  );
};

export const getPrescriberById = async (ownerId: number, id: number) => {
  return withTenantContext(ownerId, (tx) =>
    tx.prescriber.findFirst({
      where: { id, ownerId },
      include: { clinic: true, hmrReviews: true },
    }),
  );
};

export const createPrescriber = async (ownerId: number, data: PrescriberCreateInput) => {
  const createData: Prisma.PrescriberCreateInput = {
    honorific: data.honorific ?? null,
    firstName: data.firstName,
    lastName: data.lastName,
    providerNumber: data.providerNumber ?? null,
    contactEmail: data.contactEmail ?? null,
    contactPhone: data.contactPhone ?? null,
    notes: data.notes ?? null,
  };

  createData.owner = { connect: { id: ownerId } };

  return withTenantContext(ownerId, async (tx) => {
    if (data.clinicId) {
      const clinic = await tx.clinic.findFirst({ where: { id: data.clinicId, ownerId } });
      if (!clinic) {
        return null;
      }
      createData.clinic = { connect: { id: clinic.id } };
    } else if (data.clinic) {
      createData.clinic = buildClinicCreateRelation(ownerId, data.clinic);
    }

    return tx.prescriber.create({
      data: createData,
      include: { clinic: true },
    });
  });
};

export const updatePrescriber = async (ownerId: number, id: number, data: PrescriberUpdateInput) => {
  const updatePayload: Prisma.PrescriberUpdateInput = {};

  if (typeof data.honorific !== 'undefined') {
    updatePayload.honorific = data.honorific ?? null;
  }
  if (typeof data.firstName !== 'undefined') {
    updatePayload.firstName = data.firstName;
  }
  if (typeof data.lastName !== 'undefined') {
    updatePayload.lastName = data.lastName;
  }
  if (typeof data.providerNumber !== 'undefined') {
    updatePayload.providerNumber = data.providerNumber ?? null;
  }
  if (typeof data.contactEmail !== 'undefined') {
    updatePayload.contactEmail = data.contactEmail ?? null;
  }
  if (typeof data.contactPhone !== 'undefined') {
    updatePayload.contactPhone = data.contactPhone ?? null;
  }
  if (typeof data.notes !== 'undefined') {
    updatePayload.notes = data.notes ?? null;
  }
  return withTenantContext(ownerId, async (tx) => {
    const existing = await tx.prescriber.findFirst({ where: { id, ownerId } });
    if (!existing) {
      return null;
    }

    if (typeof data.clinicId !== 'undefined') {
      if (data.clinicId) {
        const clinic = await tx.clinic.findFirst({ where: { id: data.clinicId, ownerId } });
        if (!clinic) {
          return null;
        }
        updatePayload.clinic = { connect: { id: clinic.id } };
      } else {
        updatePayload.clinic = { disconnect: true };
      }
    } else if (typeof data.clinic !== 'undefined') {
      if (data.clinic) {
        updatePayload.clinic = buildClinicCreateRelation(ownerId, data.clinic);
      } else {
        updatePayload.clinic = { disconnect: true };
      }
    }

    return tx.prescriber.update({
      where: { id },
      data: updatePayload,
      include: { clinic: true },
    });
  });
};

export const deletePrescriber = async (ownerId: number, id: number) => {
  return withTenantContext(ownerId, async (tx) => {
    const deleted = await tx.prescriber.deleteMany({ where: { id, ownerId } });
    return deleted.count > 0;
  });
};
