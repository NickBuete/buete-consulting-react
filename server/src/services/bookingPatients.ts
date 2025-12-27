import { prisma } from '../db/prisma';
import { twilioService } from './sms/twilioService';

export const upsertBookingPatient = async (params: {
  ownerId: number;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string | null;
}) => {
  const formattedPhone = twilioService.formatAustralianPhone(params.phone);

  let patient = await prisma.patient.findFirst({
    where: {
      ownerId: params.ownerId,
      firstName: params.firstName,
      lastName: params.lastName,
    },
  });

  if (!patient) {
    patient = await prisma.patient.create({
      data: {
        ownerId: params.ownerId,
        firstName: params.firstName,
        lastName: params.lastName,
        contactPhone: formattedPhone,
        contactEmail: params.email || null,
      },
    });
  } else {
    patient = await prisma.patient.update({
      where: { id: patient.id },
      data: {
        contactPhone: formattedPhone,
        contactEmail: params.email || null,
      },
    });
  }

  return { patient, formattedPhone };
};
