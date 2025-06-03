import * as crypto from 'crypto';
import { WebhookEvent, WebhookVerificationResult, TransVoucherError } from '../types';

export class WebhookUtils {
  /**
   * Verify webhook signature
   */
  static verifySignature(
    payload: string | Buffer,
    signature: string,
    secret: string
  ): boolean {
    try {
      const expectedSignature = this.generateSignature(payload, secret);
      return this.secureCompare(signature, expectedSignature);
    } catch (error) {
      return false;
    }
  }

  /**
   * Parse and verify webhook event
   */
  static parseEvent(
    payload: string | Buffer,
    signature: string,
    secret: string
  ): WebhookVerificationResult {
    try {
      // Verify signature first
      if (!this.verifySignature(payload, signature, secret)) {
        return {
          isValid: false,
          error: 'Invalid webhook signature'
        };
      }

      // Parse payload
      const payloadString = typeof payload === 'string' ? payload : payload.toString('utf8');
      const eventData = JSON.parse(payloadString);

      // Validate event structure
      const validationResult = this.validateEventStructure(eventData);
      if (!validationResult.isValid) {
        return validationResult;
      }

      return {
        isValid: true,
        event: eventData as WebhookEvent
      };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Failed to parse webhook event'
      };
    }
  }

  /**
   * Generate webhook signature
   */
  static generateSignature(payload: string | Buffer, secret: string): string {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload);
    return `sha256=${hmac.digest('hex')}`;
  }

  /**
   * Secure string comparison to prevent timing attacks
   */
  private static secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }

    return result === 0;
  }

  /**
   * Validate webhook event structure
   */
  private static validateEventStructure(eventData: any): WebhookVerificationResult {
    if (!eventData || typeof eventData !== 'object') {
      return {
        isValid: false,
        error: 'Event data must be an object'
      };
    }

    if (!eventData.id || typeof eventData.id !== 'string') {
      return {
        isValid: false,
        error: 'Event must have a valid ID'
      };
    }

    if (!eventData.type || typeof eventData.type !== 'string') {
      return {
        isValid: false,
        error: 'Event must have a valid type'
      };
    }

    const validEventTypes = [
      'payment.created',
      'payment.processing',
      'payment.completed',
      'payment.failed',
      'payment.expired',
      'payment.cancelled'
    ];

    if (!validEventTypes.includes(eventData.type)) {
      return {
        isValid: false,
        error: `Invalid event type: ${eventData.type}`
      };
    }

    if (!eventData.data || typeof eventData.data !== 'object') {
      return {
        isValid: false,
        error: 'Event must have valid data'
      };
    }

    if (!eventData.created_at || typeof eventData.created_at !== 'string') {
      return {
        isValid: false,
        error: 'Event must have a valid created_at timestamp'
      };
    }

    // Validate payment data structure
    const paymentData = eventData.data;
    if (!paymentData.id || typeof paymentData.id !== 'string') {
      return {
        isValid: false,
        error: 'Payment data must have a valid ID'
      };
    }

    if (typeof paymentData.amount !== 'number' || paymentData.amount <= 0) {
      return {
        isValid: false,
        error: 'Payment data must have a valid amount'
      };
    }

    if (!paymentData.currency || typeof paymentData.currency !== 'string') {
      return {
        isValid: false,
        error: 'Payment data must have a valid currency'
      };
    }

    if (!paymentData.status || typeof paymentData.status !== 'string') {
      return {
        isValid: false,
        error: 'Payment data must have a valid status'
      };
    }

    return { isValid: true };
  }

  /**
   * Extract signature from header
   */
  static extractSignature(signatureHeader: string): string {
    if (!signatureHeader) {
      throw new TransVoucherError('Signature header is required');
    }

    // Handle different signature header formats
    if (signatureHeader.startsWith('sha256=')) {
      return signatureHeader;
    }

    // If it's in the format "t=timestamp,v1=signature"
    const parts = signatureHeader.split(',');
    for (const part of parts) {
      if (part.startsWith('v1=')) {
        return `sha256=${part.substring(3)}`;
      }
    }

    throw new TransVoucherError('Invalid signature header format');
  }

  /**
   * Check if webhook event is recent (within tolerance)
   */
  static isEventRecent(
    timestamp: string | number,
    toleranceInSeconds: number = 300
  ): boolean {
    try {
      const eventTime = typeof timestamp === 'string' 
        ? new Date(timestamp).getTime() 
        : timestamp * 1000;
      
      const currentTime = Date.now();
      const timeDifference = Math.abs(currentTime - eventTime) / 1000;
      
      return timeDifference <= toleranceInSeconds;
    } catch {
      return false;
    }
  }

  /**
   * Create a webhook event handler function
   */
  static createHandler(
    secret: string,
    handlers: Partial<Record<string, (event: WebhookEvent) => void | Promise<void>>>
  ) {
    return async (payload: string | Buffer, signature: string): Promise<void> => {
      const result = this.parseEvent(payload, signature, secret);
      
      if (!result.isValid || !result.event) {
        throw new TransVoucherError(result.error || 'Invalid webhook event');
      }

      const handler = handlers[result.event.type];
      if (handler) {
        await handler(result.event);
      }
    };
  }
} 