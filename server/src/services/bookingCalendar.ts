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
  if (!user.calendarSyncEnabled) {
    console.log('[Calendar] Calendar sync disabled for user', user.id);
    return null;
  }

  if (!user.microsoftAccessToken) {
    console.log('[Calendar] No access token found for user', user.id);
    return null;
  }

  // Check if token is expired
  if (user.microsoftTokenExpiry && new Date() >= user.microsoftTokenExpiry) {
    console.log('[Calendar] Access token expired for user', user.id, {
      expiry: user.microsoftTokenExpiry,
      now: new Date(),
    });

    if (!user.microsoftRefreshToken) {
      console.error('[Calendar] No refresh token available for user', user.id);
      return null;
    }

    try {
      console.log('[Calendar] Attempting to refresh access token for user', user.id);
      const refreshed = await graphService.refreshAccessToken(user.microsoftRefreshToken);

      const newExpiry = new Date(Date.now() + refreshed.expiresIn * 1000);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          microsoftAccessToken: refreshed.accessToken,
          microsoftRefreshToken: refreshed.refreshToken,
          microsoftTokenExpiry: newExpiry,
        },
      });

      console.log('[Calendar] Token refreshed successfully for user', user.id, {
        newExpiry,
      });

      return refreshed.accessToken;
    } catch (error) {
      console.error('[Calendar] Failed to refresh token for user', user.id, error);
      return null;
    }
  }

  console.log('[Calendar] Using existing valid access token for user', user.id);
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
    console.error('[Calendar] No access token available for user', params.user.id);
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

  console.log('[Calendar] Creating calendar event:', {
    subject: eventParams.subject,
    start: eventParams.startDateTime,
    end: eventParams.endDateTime,
    hasAttendees: !!eventParams.attendees,
  });

  const eventId = await graphService.createCalendarEvent(accessToken, eventParams);

  console.log('[Calendar] Event created with ID:', eventId);

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
