// Base API service configuration and common functions

import { configureOfflineQueue, enqueueOfflineAction, processOfflineQueue } from '../offline/offlineQueue';

const normalizeBaseUrl = (value: string) => value.replace(/\/+$/, '');

const rawBaseUrl = normalizeBaseUrl(process.env.REACT_APP_API_URL || 'http://localhost:4000');
const hasApiSuffix = rawBaseUrl.endsWith('/api');

export const SERVER_BASE_URL = hasApiSuffix ? rawBaseUrl.slice(0, -4) : rawBaseUrl;
export const API_BASE_URL = hasApiSuffix ? rawBaseUrl : `${rawBaseUrl}/api`;

// API responses return JSON directly from the backend
type ApiResponse<T> = T;

// Request configuration
interface RequestConfig extends RequestInit {
  timeout?: number;
}

// Custom fetch with timeout and error handling
const fetchWithTimeout = async (url: string, config: RequestConfig = {}): Promise<Response> => {
  const { timeout = 10000, ...fetchConfig } = config;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...fetchConfig,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// Base API class
class ApiService {
  private baseURL: string;
  private defaultHeaders: HeadersInit;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
    configureOfflineQueue({ baseUrl: this.baseURL });
  }

  // Set authentication token
  setAuthToken(token: string) {
    this.defaultHeaders = {
      ...this.defaultHeaders,
      Authorization: `Bearer ${token}`,
    };
  }

  // Remove authentication token
  removeAuthToken() {
    const { Authorization, ...headers } = this.defaultHeaders as any;
    this.defaultHeaders = headers;
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const requestConfig: RequestConfig = {
      credentials: 'include',
      ...config,
      headers: {
        ...this.defaultHeaders,
        ...config.headers,
      },
    };

    try {
      if (typeof window !== 'undefined' && navigator.onLine) {
        void processOfflineQueue();
      }

      const response = await fetchWithTimeout(url, requestConfig);
      
      if (!response.ok) {
        let message = `HTTP ${response.status}: ${response.statusText}`;

        try {
          const errorBody = await response.json();
          if (errorBody && typeof errorBody.error === 'string') {
            message = errorBody.error;
          } else if (errorBody && typeof errorBody.message === 'string') {
            message = errorBody.message;
          }
        } catch (parseError) {
          // ignore JSON parse failures and fall back to default message
        }

        throw new Error(message);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      const method = (config?.method ?? 'GET').toUpperCase();
      const isMutation = method !== 'GET';
      const offline = typeof navigator !== 'undefined' && !navigator.onLine;

      if (isMutation && (offline || error instanceof TypeError)) {
        const rawHeaders = requestConfig.headers ?? {};
        const serializedHeaders: Record<string, string> = Array.isArray(rawHeaders)
          ? Object.fromEntries(rawHeaders)
          : rawHeaders instanceof Headers
          ? Object.fromEntries(rawHeaders.entries())
          : (rawHeaders as Record<string, string>);

        await enqueueOfflineAction({
          method,
          endpoint,
          body:
            typeof requestConfig.body === 'string'
              ? requestConfig.body
              : requestConfig.body
              ? JSON.stringify(requestConfig.body)
              : undefined,
          headers: serializedHeaders,
        });

        throw new Error('Request queued for sync once connection is restored.');
      }

      if (error instanceof Error) {
        throw new Error(`API request failed: ${error.message}`);
      }
      throw new Error('Unknown API error occurred');
    }
  }

  // GET request
  async get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PATCH request
  async patch<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }

  // File upload
  async uploadFile<T>(endpoint: string, file: File, config?: RequestConfig): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    const uploadConfig = {
      ...config,
      method: 'POST',
      body: formData,
      headers: {
        // Remove Content-Type to let browser set it with boundary
        ...Object.fromEntries(
          Object.entries(this.defaultHeaders).filter(([key]) => key !== 'Content-Type')
        ),
        ...config?.headers,
      },
    };

    return this.request<T>(endpoint, uploadConfig);
  }
}

// Create and export default API instance
export const api = new ApiService();

// Export types and classes for extending
export type { ApiResponse, RequestConfig };
export { ApiService };
