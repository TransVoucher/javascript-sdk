import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { 
  TransVoucherConfig, 
  ApiResponse, 
  RequestOptions,
  TransVoucherError,
  AuthenticationError,
  ValidationError,
  ApiError,
  NetworkError
} from '../types';

export class HttpClient {
  private client: AxiosInstance;
  private config: TransVoucherConfig;

  constructor(config: TransVoucherConfig) {
    this.config = config;
    this.client = this.createAxiosInstance();
  }

  private createAxiosInstance(): AxiosInstance {
    const baseURL = this.config.baseUrl || this.getDefaultBaseUrl();
    
    const instance = axios.create({
      baseURL,
      timeout: this.config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
        'User-Agent': 'TransVoucher-JavaScript-SDK/1.0.0'
      }
    });

    // Request interceptor
    instance.interceptors.request.use(
      (config) => {
        // Add any request modifications here
        return config;
      },
      (error) => {
        return Promise.reject(this.handleError(error));
      }
    );

    // Response interceptor
    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        return Promise.reject(this.handleError(error));
      }
    );

    return instance;
  }

  private getDefaultBaseUrl(): string {
    const subdomain = this.config.environment === 'production' ? 'api' : 'api-sandbox';
    return `https://${subdomain}.transvoucher.com/v1`;
  }

  private handleError(error: any): TransVoucherError {
    if (error.response) {
      const { status, data } = error.response;
      const message = data?.message || error.message || 'An API error occurred';

      // Handle specific status codes
      switch (status) {
        case 401:
          return new AuthenticationError(message, status, data);
        case 422:
          return new ValidationError(
            message,
            data?.errors || {},
            status,
            data
          );
        case 400:
        case 403:
        case 404:
        case 409:
        case 429:
          return new ApiError(message, status, data);
        default:
          return new TransVoucherError(message, 'API_ERROR', status, data);
      }
    } else if (error.request) {
      return new NetworkError('Network error: No response received', error);
    } else {
      return new NetworkError(`Request error: ${error.message}`, error);
    }
  }

  async get<T = any>(
    url: string, 
    params?: Record<string, any>, 
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    try {
      const config: AxiosRequestConfig = {
        params,
        ...this.buildRequestConfig(options)
      };

      const response: AxiosResponse<ApiResponse<T>> = await this.client.get(url, config);
      return response.data;
    } catch (error) {
      throw error instanceof TransVoucherError ? error : this.handleError(error);
    }
  }

  async post<T = any>(
    url: string, 
    data?: any, 
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    try {
      const config = this.buildRequestConfig(options);
      const response: AxiosResponse<ApiResponse<T>> = await this.client.post(url, data, config);
      return response.data;
    } catch (error) {
      throw error instanceof TransVoucherError ? error : this.handleError(error);
    }
  }

  async put<T = any>(
    url: string, 
    data?: any, 
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    try {
      const config = this.buildRequestConfig(options);
      const response: AxiosResponse<ApiResponse<T>> = await this.client.put(url, data, config);
      return response.data;
    } catch (error) {
      throw error instanceof TransVoucherError ? error : this.handleError(error);
    }
  }

  async patch<T = any>(
    url: string, 
    data?: any, 
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    try {
      const config = this.buildRequestConfig(options);
      const response: AxiosResponse<ApiResponse<T>> = await this.client.patch(url, data, config);
      return response.data;
    } catch (error) {
      throw error instanceof TransVoucherError ? error : this.handleError(error);
    }
  }

  async delete<T = any>(
    url: string, 
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    try {
      const config = this.buildRequestConfig(options);
      const response: AxiosResponse<ApiResponse<T>> = await this.client.delete(url, config);
      return response.data;
    } catch (error) {
      throw error instanceof TransVoucherError ? error : this.handleError(error);
    }
  }

  private buildRequestConfig(options?: RequestOptions): AxiosRequestConfig {
    const config: AxiosRequestConfig = {};

    if (options?.timeout) {
      config.timeout = options.timeout;
    }

    if (options?.headers) {
      config.headers = { ...config.headers, ...options.headers };
    }

    return config;
  }

  getBaseUrl(): string {
    return this.client.defaults.baseURL || '';
  }

  updateConfig(newConfig: Partial<TransVoucherConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.client = this.createAxiosInstance();
  }
} 