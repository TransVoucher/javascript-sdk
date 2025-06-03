import { HttpClient } from '../http/client';
import {
  CreatePaymentRequest,
  Payment,
  PaymentListRequest,
  PaymentList,
  ApiResponse,
  PaginatedResponse,
  ValidationError,
  RequestOptions
} from '../types';

export class PaymentService {
  constructor(private httpClient: HttpClient) {}

  /**
   * Create a new payment
   */
  async create(data: CreatePaymentRequest, options?: RequestOptions): Promise<Payment> {
    this.validateCreatePaymentRequest(data);

    const response = await this.httpClient.post<Payment>('/payments', data, options);
    
    if (!response.success || !response.data) {
      throw new ValidationError('Invalid response from payment creation', {});
    }

    return response.data;
  }

  /**
   * Get payment status by ID
   */
  async getStatus(paymentId: string, options?: RequestOptions): Promise<Payment> {
    if (!paymentId || typeof paymentId !== 'string') {
      throw new ValidationError('Payment ID is required and must be a string', {
        paymentId: ['Payment ID is required and must be a string']
      });
    }

    const response = await this.httpClient.get<Payment>(`/payments/${paymentId}`, undefined, options);
    
    if (!response.success || !response.data) {
      throw new ValidationError('Invalid response from payment status check', {});
    }

    return response.data;
  }

  /**
   * List payments with optional filters
   */
  async list(params: PaymentListRequest = {}, options?: RequestOptions): Promise<PaymentList> {
    this.validateListRequest(params);

    const queryParams: Record<string, any> = {};
    
    if (params.page !== undefined) queryParams.page = params.page;
    if (params.per_page !== undefined) queryParams.per_page = params.per_page;
    if (params.status) queryParams.status = params.status;
    if (params.currency) queryParams.currency = params.currency;
    if (params.from_date) queryParams.from_date = params.from_date;
    if (params.to_date) queryParams.to_date = params.to_date;
    if (params.reference) queryParams.reference = params.reference;
    if (params.customer_email) queryParams.customer_email = params.customer_email;

    const response = await this.httpClient.get<PaymentList>('/payments', queryParams, options);
    
    if (!response.success || !response.data) {
      throw new ValidationError('Invalid response from payment list', {});
    }

    return response.data;
  }

  /**
   * Get payment by reference
   */
  async getByReference(reference: string, options?: RequestOptions): Promise<Payment | null> {
    if (!reference || typeof reference !== 'string') {
      throw new ValidationError('Reference is required and must be a string', {
        reference: ['Reference is required and must be a string']
      });
    }

    const response = await this.list({ reference }, options);
    
    return response.payments.length > 0 ? response.payments[0] : null;
  }

  private validateCreatePaymentRequest(data: CreatePaymentRequest): void {
    const errors: Record<string, string[]> = {};

    // Required fields
    if (!data.amount) {
      errors.amount = ['Amount is required'];
    } else if (typeof data.amount !== 'number' || data.amount <= 0) {
      errors.amount = ['Amount must be a positive number'];
    }

    if (!data.currency) {
      errors.currency = ['Currency is required'];
    } else if (typeof data.currency !== 'string' || data.currency.length !== 3) {
      errors.currency = ['Currency must be a 3-character string (e.g., USD, EUR)'];
    }

    // Optional field validations
    if (data.customer_email && !this.isValidEmail(data.customer_email)) {
      errors.customer_email = ['Customer email must be a valid email address'];
    }

    if (data.webhook_url && !this.isValidUrl(data.webhook_url)) {
      errors.webhook_url = ['Webhook URL must be a valid URL'];
    }

    if (data.redirect_url && !this.isValidUrl(data.redirect_url)) {
      errors.redirect_url = ['Redirect URL must be a valid URL'];
    }

    if (data.reference && (typeof data.reference !== 'string' || data.reference.length > 255)) {
      errors.reference = ['Reference must be a string with maximum 255 characters'];
    }

    if (data.description && (typeof data.description !== 'string' || data.description.length > 1000)) {
      errors.description = ['Description must be a string with maximum 1000 characters'];
    }

    if (data.customer_name && (typeof data.customer_name !== 'string' || data.customer_name.length > 255)) {
      errors.customer_name = ['Customer name must be a string with maximum 255 characters'];
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError('Validation failed', errors);
    }
  }

  private validateListRequest(params: PaymentListRequest): void {
    const errors: Record<string, string[]> = {};

    if (params.page !== undefined && (!Number.isInteger(params.page) || params.page < 1)) {
      errors.page = ['Page must be a positive integer'];
    }

    if (params.per_page !== undefined && (!Number.isInteger(params.per_page) || params.per_page < 1 || params.per_page > 100)) {
      errors.per_page = ['Per page must be an integer between 1 and 100'];
    }

    if (params.status && !['pending', 'processing', 'completed', 'failed', 'expired', 'cancelled'].includes(params.status)) {
      errors.status = ['Status must be one of: pending, processing, completed, failed, expired, cancelled'];
    }

    if (params.currency && (typeof params.currency !== 'string' || params.currency.length !== 3)) {
      errors.currency = ['Currency must be a 3-character string'];
    }

    if (params.from_date && !this.isValidDate(params.from_date)) {
      errors.from_date = ['From date must be a valid date in YYYY-MM-DD format'];
    }

    if (params.to_date && !this.isValidDate(params.to_date)) {
      errors.to_date = ['To date must be a valid date in YYYY-MM-DD format'];
    }

    if (params.customer_email && !this.isValidEmail(params.customer_email)) {
      errors.customer_email = ['Customer email must be a valid email address'];
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError('Validation failed', errors);
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private isValidDate(date: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) return false;
    
    const parsedDate = new Date(date);
    return parsedDate instanceof Date && !isNaN(parsedDate.getTime());
  }
} 