import type { User } from '@prisma/client';
import { prisma } from '../db/prisma';
import { graphService } from './microsoft/graphClient';

export type CalendarUser = Pick<
  User,
  | 'id'
  | 'calendarSyncEnabled'
  | 'microsoftAccessToken'
  | 'microsoftRefreshToken'
  | 'microsoftTokenExpiry'
>;

const buildBookingEventBody = (params: {
  patientName: string;
  referrerName: string;
  referrerClinic?: string | null;
  referralReason?: string | null;
  formattedPhone: string;
}) => {
  const clinicLine = params.referrerClinic
    ? `<p>Clinic: ${params.referrerClinic}</p>`
    : '';
  const referralReason = params.referralReason || 'Not specified';

  return `
    <p><strong>Home Medicines Review</strong></p>
    <p>Patient: ${params.patientName}</p>
    <p>Referred by: ${params.referrerName}</p>
    ${clinicLine}
    <p>Reason: ${referralReason}</p>
    <p>Phone: ${params.formattedPhone}</p>
  `;
};

export const ensureMicrosoftAccessToken = async (user: CalendarUser) => {
  if (!user.calendarSyncEnabled || !user.microsoftAccessToken) {
    return null;
  }

  if (user.microsoftTokenExpiry && new Date() >= user.microsoftTokenExpiry) {
    if (!user.microsoftRefreshToken) {
      return null;
    }

    const refreshed = await graphService.refreshAccessToken(user.microsoftRefreshToken);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        microsoftAccessToken: refreshed.accessToken,
        microsoftRefreshToken: refreshed.refreshToken,
        microsoftTokenExpiry: new Date(Date.now() + refreshed.expiresIn * 1000),
      },
    });

    return refreshed.accessToken;
  }

  return user.microsoftAccessToken;
};

export const createBookingCalendarEvent = async (params: {
  user: CalendarUser;
  patientName: string;
  referrerName: string;
  referrerClinic?: string | null;
  referralReason?: string | null;
  formattedPhone: string;
  appointmentStart: Date;
  appointmentEnd: Date;
  patientEmail?: string | null;
  location?: string;
}) => {
  const accessToken = await ensureMicrosoftAccessToken(params.user);
  if (!accessToken) {
    return null;
  }

  const eventParams: {
    subject: string;
    body: string;
    startDateTime: string;
    endDateTime: string;
    attendees?: Array<{ emailAddress: string; name: string }>;
    location?: string;
  } = {
    subject: `HMR: ${params.patientName}`,
    body: buildBookingEventBody({
      patientName: params.patientName,
      referrerName: params.referrerName,
      referrerClinic: params.referrerClinic ?? null,
      referralReason: params.referralReason ?? null,
      formattedPhone: params.formattedPhone,
    }),
    startDateTime: params.appointmentStart.toISOString(),
    endDateTime: params.appointmentEnd.toISOString(),
  };

  if (params.patientEmail) {
    eventParams.attendees = [
      {
        emailAddress: params.patientEmail,
        name: params.patientName,
      },
    ];
  }

  if (params.location) {
    eventParams.location = params.location;
  }

  const eventId = await graphService.createCalendarEvent(accessToken, eventParams);

  return eventId;
};

export const updateBookingCalendarEvent = async (params: {
  user: CalendarUser;
  eventId: string;
  appointmentStart: Date;
  appointmentEnd: Date;
}) => {
  const accessToken = await ensureMicrosoftAccessToken(params.user);
  if (!accessToken) {
    return false;
  }

  await graphService.updateCalendarEvent(accessToken, params.eventId, {
    startDateTime: params.appointmentStart.toISOString(),
    endDateTime: params.appointmentEnd.toISOString(),
  });

  return true;
};
