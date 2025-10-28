import { HttpClient } from '../http/client';
import {
  CreatePaymentRequest,
  Payment,
  PaymentListRequest,
  PaymentList,
  ApiResponse,
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

    const response = await this.httpClient.post<Payment>('/payment/create', data, options);
    
    if (!response.success || !response.data) {
      throw new ValidationError('Invalid response from payment creation', {});
    }

    return response.data;
  }

  /**
   * Get payment status by ID
   */
  async getTransactionStatus(transactionId: string, options?: RequestOptions): Promise<Payment> {
    if (!transactionId) {
      throw new ValidationError('Transaction ID is required', {
        transactionId: ['Transaction ID is required']
      });
    }

    const response = await this.httpClient.get<Payment>(`/payment/status/${transactionId}`, undefined, options);
    
    if (!response.success || !response.data) {
      throw new ValidationError('Invalid response from payment status check', {});
    }

    return response.data;
  }

    /**
   * Get payment status by ID
   */
  async getPaymentLinkStatus(paymentLinkId: string, options?: RequestOptions): Promise<Payment> {
    if (!paymentLinkId) {
      throw new ValidationError('Payment Link ID is required and must be a number', {
        paymentId: ['Payment Link ID is required and must be a number']
      });
    }

    const response = await this.httpClient.get<Payment>(`/payment-link/status/${paymentLinkId}`, undefined, options);
    
    if (!response.success || !response.data) {
      throw new ValidationError('Invalid response from payment status check', {});
    }

    return response.data;
  }

  /**
   * Check if the payment is completed
   */
  isCompleted(payment: Payment): boolean {
    return payment.status === 'completed';
  }

  /**
   * Check if the payment is attempting
   */
  isAttempting(payment: Payment): boolean {
    return payment.status === 'attempting';
  }

  /**
   * Check if the payment is processing
   */
  isProcessing(payment: Payment): boolean {
    return payment.status === 'processing';
  }

  /**
   * Check if the payment is pending
   */
  isPending(payment: Payment): boolean {
    return payment.status === 'pending';
  }

  /**
   * Check if the payment has failed
   */
  isFailed(payment: Payment): boolean {
    return payment.status === 'failed';
  }

  /**
   * Check if the payment has expired
   */
  isExpired(payment: Payment): boolean {
    return payment.status === 'expired';
  }

  /**
   * Check if the payment has been cancelled
   */
  isCancelled(payment: Payment): boolean {
    return payment.status === 'cancelled';
  }

  /**
   * List payments with optional filters
   */
  async list(params: PaymentListRequest = {}, options?: RequestOptions): Promise<PaymentList> {
    this.validateListRequest(params);

    const queryParams: Record<string, any> = {};

    if (params.limit !== undefined) queryParams.limit = params.limit;
    if (params.page_token) queryParams.page_token = params.page_token;
    if (params.status) queryParams.status = params.status;
    if (params.from_date) queryParams.from_date = params.from_date;
    if (params.to_date) queryParams.to_date = params.to_date;

    const response = await this.httpClient.get<PaymentList>('/payments', queryParams, options);

    if (!response.success || !response.data) {
      throw new ValidationError('Invalid response from payment list', {});
    }

    return response.data;
  }

  private validateCreatePaymentRequest(data: CreatePaymentRequest): void {
    const errors: Record<string, string[]> = {};

    // Check if dynamic pricing is enabled
    const isPriceDynamic = data.is_price_dynamic === true;

    // Validate is_price_dynamic if provided
    if (data.is_price_dynamic !== undefined && typeof data.is_price_dynamic !== 'boolean') {
      errors.is_price_dynamic = ['is_price_dynamic must be a boolean'];
    }

    // Amount is required unless dynamic pricing is enabled
    if (!isPriceDynamic) {
      if (!data.amount) {
        errors.amount = ['Amount is required'];
      } else if (typeof data.amount !== 'number' || data.amount <= 0) {
        errors.amount = ['Amount must be a positive number'];
      }
    } else if (data.amount !== undefined) {
      // If amount is provided with dynamic pricing, validate it anyway
      if (typeof data.amount !== 'number' || data.amount <= 0) {
        errors.amount = ['Amount must be a positive number'];
      }
    }

    if (!data.currency) {
      errors.currency = ['Currency is required'];
    } else if (typeof data.currency !== 'string' || data.currency.length !== 3) {
      errors.currency = ['Currency must be a 3-character string (USD, EUR, NZD, AUD, PLN, KES, TRY, INR)'];
    }

    // Optional field validations
    if (data.title && (typeof data.title !== 'string' || data.title.length > 255)) {
      errors.title = ['Title must be a string with maximum 255 characters'];
    }

    if (data.description && (typeof data.description !== 'string' || data.description.length > 1000)) {
      errors.description = ['Description must be a string with maximum 1000 characters'];
    }

    if (data.multiple_use !== undefined && typeof data.multiple_use !== 'boolean') {
      errors.multiple_use = ['Multiple use must be a boolean'];
    }

    if (data.cancel_on_first_fail !== undefined && typeof data.cancel_on_first_fail !== 'boolean') {
      errors.cancel_on_first_fail = ['cancel_on_first_fail must be a boolean'];
    }

    if (data.expires_at && !this.isValidDate(data.expires_at)) {
      errors.expires_at = ['Expires at must be a valid date'];
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError('Validation failed', errors);
    }
  }

  private validateListRequest(params: PaymentListRequest): void {
    const errors: Record<string, string[]> = {};

    if (params.limit !== undefined && (!Number.isInteger(params.limit) || params.limit < 1 || params.limit > 100)) {
      errors.limit = ['Limit must be an integer between 1 and 100'];
    }

    if (params.page_token !== undefined && typeof params.page_token !== 'string') {
      errors.page_token = ['Page token must be a string'];
    }

    if (params.status && !['pending', 'attempting', 'processing', 'completed', 'failed', 'expired', 'cancelled'].includes(params.status)) {
      errors.status = ['Status must be one of: pending, attempting, processing, completed, failed, expired, cancelled'];
    }

    if (params.from_date && !this.isValidDate(params.from_date)) {
      errors.from_date = ['From date must be a valid date in YYYY-MM-DD format'];
    }

    if (params.to_date && !this.isValidDate(params.to_date)) {
      errors.to_date = ['To date must be a valid date in YYYY-MM-DD format'];
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