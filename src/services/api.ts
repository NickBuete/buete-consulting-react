// Base API service configuration and common functions

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// API response interface
interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

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
      headers: {
        ...this.defaultHeaders,
        ...config.headers,
      },
      ...config,
    };

    try {
      const response = await fetchWithTimeout(url, requestConfig);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
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