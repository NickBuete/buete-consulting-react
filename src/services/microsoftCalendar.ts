import { api, SERVER_BASE_URL } from './api';

export interface CalendarStatus {
  connected: boolean;
  email?: string;
  lastSync?: string;
  autoSync?: boolean;
}

export const getMicrosoftLoginUrl = () => `${SERVER_BASE_URL}/api/auth/microsoft/login`;

export const getMicrosoftCalendarStatus = async () => {
  const response = await api.get<CalendarStatus>('/auth/microsoft/status');
  return response;
};

export const disconnectMicrosoftCalendar = async () => {
  await api.post<void>('/auth/microsoft/disconnect');
};

export const syncMicrosoftCalendar = async () => {
  await api.post<void>('/auth/microsoft/sync');
};

export const updateMicrosoftAutoSync = async (autoSync: boolean) => {
  await api.patch<void>('/auth/microsoft/auto-sync', { autoSync });
};
