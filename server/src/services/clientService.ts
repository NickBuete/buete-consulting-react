import { Prisma } from '../generated/prisma';
import { prisma } from '../db/prisma';
import type { ClientCreateInput, ClientUpdateInput } from '../validators/clientSchemas';
import type {
  HostingInfoCreateInput,
  HostingInfoUpdateInput,
} from '../validators/hostingInfoSchemas';
import type {
  SubscriptionCreateInput,
  SubscriptionUpdateInput,
} from '../validators/subscriptionSchemas';

export type ListClientsOptions = {
  search?: string;
};

export const listClients = async (options?: ListClientsOptions) => {
  const search = options?.search?.trim();

  const query: Prisma.ClientFindManyArgs = {
    include: {
      hostingInfo: true,
      subscriptions: true,
    },
    orderBy: { createdAt: 'desc' },
  };

  if (search) {
    query.where = {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { contactEmail: { contains: search, mode: 'insensitive' } },
      ],
    } satisfies Prisma.ClientWhereInput;
  }

  return prisma.client.findMany(query);
};

export const getClientById = async (id: number) => {
  return prisma.client.findUnique({
    where: { id },
    include: {
      hostingInfo: true,
      subscriptions: true,
    },
  });
};

export const createClient = async (data: ClientCreateInput) => {
  return prisma.client.create({
    data: {
      name: data.name,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone ?? null,
      businessDetails: data.businessDetails ?? null,
    },
  });
};

export const updateClient = async (id: number, data: ClientUpdateInput) => {
  const updatePayload: Prisma.ClientUpdateInput = {};

  if (typeof data.name !== 'undefined') {
    updatePayload.name = data.name;
  }
  if (typeof data.contactEmail !== 'undefined') {
    updatePayload.contactEmail = data.contactEmail;
  }
  if (typeof data.contactPhone !== 'undefined') {
    updatePayload.contactPhone = data.contactPhone ?? null;
  }
  if (typeof data.businessDetails !== 'undefined') {
    updatePayload.businessDetails = data.businessDetails ?? null;
  }

  return prisma.client.update({
    where: { id },
    data: updatePayload,
  });
};

export const deleteClient = async (id: number) => {
  return prisma.client.delete({
    where: { id },
  });
};

export const listHostingInfoForClient = async (clientId: number) => {
  return prisma.hostingInfo.findMany({
    where: { clientId },
    orderBy: { id: 'asc' },
  });
};

export const createHostingInfoForClient = async (
  clientId: number,
  data: HostingInfoCreateInput,
) => {
  return prisma.hostingInfo.create({
    data: {
      domain: data.domain,
      provider: data.provider,
      credentials: data.credentials,
      notes: data.notes ?? null,
      client: { connect: { id: clientId } },
    },
  });
};

export const updateHostingInfoForClient = async (
  clientId: number,
  id: number,
  data: HostingInfoUpdateInput,
) => {
  const record = await prisma.hostingInfo.findFirst({ where: { id, clientId } });
  if (!record) {
    return null;
  }

  const updatePayload: Prisma.HostingInfoUpdateInput = {};

  if (typeof data.domain !== 'undefined') {
    updatePayload.domain = data.domain;
  }
  if (typeof data.provider !== 'undefined') {
    updatePayload.provider = data.provider;
  }
  if (typeof data.credentials !== 'undefined') {
    updatePayload.credentials = data.credentials;
  }
  if (typeof data.notes !== 'undefined') {
    updatePayload.notes = data.notes ?? null;
  }

  return prisma.hostingInfo.update({
    where: { id },
    data: updatePayload,
  });
};

export const deleteHostingInfoForClient = async (clientId: number, id: number) => {
  const record = await prisma.hostingInfo.findFirst({ where: { id, clientId } });
  if (!record) {
    return null;
  }

  await prisma.hostingInfo.delete({ where: { id } });
  return true;
};

export const listSubscriptionsForClient = async (clientId: number) => {
  return prisma.subscription.findMany({
    where: { clientId },
    orderBy: { startDate: 'desc' },
  });
};

export const createSubscriptionForClient = async (
  clientId: number,
  data: SubscriptionCreateInput,
) => {
  return prisma.subscription.create({
    data: {
      plan: data.plan,
      status: data.status,
      startDate: data.startDate,
      endDate: data.endDate ?? null,
      renewalInfo: data.renewalInfo ?? null,
      client: { connect: { id: clientId } },
    },
  });
};

export const updateSubscriptionForClient = async (
  clientId: number,
  id: number,
  data: SubscriptionUpdateInput,
) => {
  const record = await prisma.subscription.findFirst({ where: { id, clientId } });
  if (!record) {
    return null;
  }

  const updatePayload: Prisma.SubscriptionUpdateInput = {};

  if (typeof data.plan !== 'undefined') {
    updatePayload.plan = data.plan;
  }
  if (typeof data.status !== 'undefined') {
    updatePayload.status = data.status;
  }
  if (typeof data.startDate !== 'undefined') {
    updatePayload.startDate = data.startDate;
  }
  if (typeof data.endDate !== 'undefined') {
    updatePayload.endDate = data.endDate ?? null;
  }
  if (typeof data.renewalInfo !== 'undefined') {
    updatePayload.renewalInfo = data.renewalInfo ?? null;
  }

  return prisma.subscription.update({
    where: { id },
    data: updatePayload,
  });
};

export const deleteSubscriptionForClient = async (clientId: number, id: number) => {
  const record = await prisma.subscription.findFirst({ where: { id, clientId } });
  if (!record) {
    return null;
  }

  await prisma.subscription.delete({ where: { id } });
  return true;
};
