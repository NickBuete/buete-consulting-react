import { api } from './api';

export interface SmsLog {
  id: number;
  phoneNumber: string;
  message: string;
  status: 'pending' | 'sent' | 'failed';
  sentAt: string;
  hmrReviewId?: number;
  errorMessage?: string;
}

export interface SmsLogsResponse {
  logs: SmsLog[];
  total: number;
  page: number;
  pageSize: number;
}

const buildQueryString = (params: Record<string, string | number | undefined>) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

export const fetchSmsLogs = async (params: {
  page: number;
  pageSize: number;
  status?: string;
  search?: string;
}) => {
  const query = buildQueryString({
    page: params.page,
    pageSize: params.pageSize,
    status: params.status,
    search: params.search,
  });

  const response = await api.get<SmsLogsResponse>(`/sms/logs${query}`);
  return response;
};
