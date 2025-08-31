import { HttpClient } from './http/client';
import { PaymentService } from './services/payment';
import { WebhookUtils } from './utils/webhook';
import { 
  TransVoucherConfig, 
  ValidationError 
} from './types';

export class TransVoucher {
  private httpClient: HttpClient;
  private config: TransVoucherConfig;

  public readonly payments: PaymentService;
  public readonly webhooks = WebhookUtils;

  constructor(config: TransVoucherConfig) {
    this.validateConfig(config);
    this.config = { ...config };
    this.httpClient = new HttpClient(this.config);
    this.payments = new PaymentService(this.httpClient);
  }

  /**
   * Get current configuration
   */
  getConfig(): Readonly<TransVoucherConfig> {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<TransVoucherConfig>): void {
    if (newConfig.apiKey !== undefined || 
        newConfig.environment !== undefined || 
        newConfig.baseUrl !== undefined) {
      
      const updatedConfig = { ...this.config, ...newConfig };
      this.validateConfig(updatedConfig);
      this.config = updatedConfig;
      this.httpClient.updateConfig(updatedConfig);
    } else {
      // Only timeout can be updated without recreating the client
      this.config = { ...this.config, ...newConfig };
    }
  }

  /**
   * Get the current environment
   */
  getEnvironment(): 'sandbox' | 'production' {
    return this.config.environment || 'sandbox';
  }

  /**
   * Switch environment
   */
  switchEnvironment(environment: 'sandbox' | 'production'): void {
    this.updateConfig({ environment });
  }

  /**
   * Get current base URL
   */
  getBaseUrl(): string {
    return this.httpClient.getBaseUrl();
  }

  /**
   * Check if SDK is configured for production
   */
  isProduction(): boolean {
    return this.getEnvironment() === 'production';
  }

  /**
   * Check if SDK is configured for sandbox
   */
  isSandbox(): boolean {
    return this.getEnvironment() === 'sandbox';
  }

  /**
   * Validate API key format
   */
  static validateApiKey(apiKey: string): boolean {
    if (!apiKey || typeof apiKey !== 'string') {
      return false;
    }

    // Basic validation - should be a reasonable length and not empty
    return apiKey.trim().length >= 10;
  }

  /**
   * Create a new TransVoucher instance for sandbox
   */
  static sandbox(apiKey: string, options?: Partial<TransVoucherConfig>): TransVoucher {
    return new TransVoucher({
      apiKey,
      environment: 'sandbox',
      ...options
    });
  }

  /**
   * Create a new TransVoucher instance for production
   */
  static production(apiKey: string, options?: Partial<TransVoucherConfig>): TransVoucher {
    return new TransVoucher({
      apiKey,
      environment: 'production',
      ...options
    });
  }

  private validateConfig(config: TransVoucherConfig): void {
    const errors: Record<string, string[]> = {};

    // Validate API key
    if (!config.apiKey) {
      errors.apiKey = ['API key is required'];
    } else if (typeof config.apiKey !== 'string') {
      errors.apiKey = ['API key must be a string'];
    } else if (!TransVoucher.validateApiKey(config.apiKey)) {
      errors.apiKey = ['API key format is invalid'];
    }

    // Validate environment
    if (config.environment && !['sandbox', 'production'].includes(config.environment)) {
      errors.environment = ['Environment must be either "sandbox" or "production"'];
    }

    // Validate base URL if provided
    if (config.baseUrl) {
      try {
        new URL(config.baseUrl);
      } catch {
        errors.baseUrl = ['Base URL must be a valid URL'];
      }
    }

    // Validate timeout
    if (config.timeout !== undefined) {
      if (typeof config.timeout !== 'number' || config.timeout <= 0) {
        errors.timeout = ['Timeout must be a positive number'];
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError('Invalid configuration', errors);
    }
  }
} 