/**
 * APIService - Utilities for backend communication
 * Provides standardized API calls with error handling and retry functionality
 */

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export class APIService {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Generic GET request with error handling
   */
  async get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'GET',
      ...options,
    });
  }

  /**
   * Generic POST request with error handling
   */
  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  /**
   * Generic PUT request with error handling
   */
  async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  /**
   * Generic DELETE request with error handling
   */
  async delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      ...options,
    });
  }

  /**
   * Core request method with retry logic and error handling
   */
  private async request<T>(
    endpoint: string, 
    options: RequestInit, 
    retryCount: number = 0
  ): Promise<ApiResponse<T>> {
    const maxRetries = 2;
    const url = this.baseUrl + endpoint;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.defaultHeaders,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await this.parseErrorResponse(response);
        
        // Retry on server errors (5xx) but not client errors (4xx)
        if (response.status >= 500 && retryCount < maxRetries) {
          await this.delay(1000 * (retryCount + 1)); // Exponential backoff
          return this.request<T>(endpoint, options, retryCount + 1);
        }

        return {
          success: false,
          error: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };

    } catch (error) {
      // Retry on network errors
      if (retryCount < maxRetries && this.isNetworkError(error)) {
        await this.delay(1000 * (retryCount + 1));
        return this.request<T>(endpoint, options, retryCount + 1);
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  /**
   * Parse error response from API
   */
  private async parseErrorResponse(response: Response): Promise<ApiError> {
    try {
      const errorData = await response.json();
      return {
        message: errorData.message || errorData.error || 'An error occurred',
        status: response.status,
        code: errorData.code,
      };
    } catch {
      return {
        message: `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
      };
    }
  }

  /**
   * Check if error is a network error that should be retried
   */
  private isNetworkError(error: any): boolean {
    return error instanceof TypeError && error.message.includes('fetch');
  }

  /**
   * Delay utility for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Set authorization header
   */
  setAuthToken(token: string): void {
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Remove authorization header
   */
  clearAuthToken(): void {
    delete this.defaultHeaders['Authorization'];
  }

  /**
   * Update base URL
   */
  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }
}

// Specific API service instances for different endpoints
export const yieldPredictionAPI = new APIService('https://yield-1.onrender.com');
export const diseaseDetectionAPI = new APIService(); // Will be configured when backend is available
export const satelliteDataAPI = new APIService(); // Will be configured when backend is available

// Generic API service for general use
export const apiService = new APIService();