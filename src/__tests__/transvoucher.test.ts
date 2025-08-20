import { TransVoucher } from '../transvoucher';
import { ValidationError } from '../types';

describe('TransVoucher', () => {
  describe('constructor', () => {
    it('should create instance with valid config', () => {
      const client = new TransVoucher({
        apiKey: 'test-api-key-123456789',
        environment: 'sandbox'
      });

      expect(client.getEnvironment()).toBe('sandbox');
      expect(client.isSandbox()).toBe(true);
      expect(client.isProduction()).toBe(false);
    });

    it('should throw ValidationError with invalid API key', () => {
      expect(() => {
        new TransVoucher({
          apiKey: 'short'
        });
      }).toThrow(ValidationError);
    });

    it('should throw ValidationError with invalid environment', () => {
      expect(() => {
        new TransVoucher({
          apiKey: 'test-api-key-123456789',
          environment: 'invalid' as any
        });
      }).toThrow(ValidationError);
    });
  });

  describe('static factory methods', () => {
    it('should create sandbox instance', () => {
      const client = TransVoucher.sandbox('test-api-key-123456789');
      expect(client.getEnvironment()).toBe('sandbox');
      expect(client.isSandbox()).toBe(true);
    });

    it('should create production instance', () => {
      const client = TransVoucher.production('test-api-key-123456789');
      expect(client.getEnvironment()).toBe('production');
      expect(client.isProduction()).toBe(true);
    });
  });

  describe('environment switching', () => {
    it('should switch from sandbox to production', () => {
      const client = TransVoucher.sandbox('test-api-key-123456789');
      expect(client.isSandbox()).toBe(true);

      client.switchEnvironment('production');
      expect(client.isProduction()).toBe(true);
    });
  });

  describe('API key validation', () => {
    it('should validate correct API key', () => {
      expect(TransVoucher.validateApiKey('test-api-key-123456789')).toBe(true);
    });

    it('should reject short API key', () => {
      expect(TransVoucher.validateApiKey('short')).toBe(false);
    });

    it('should reject empty API key', () => {
      expect(TransVoucher.validateApiKey('')).toBe(false);
    });

    it('should reject non-string API key', () => {
      expect(TransVoucher.validateApiKey(null as any)).toBe(false);
      expect(TransVoucher.validateApiKey(undefined as any)).toBe(false);
    });
  });

  describe('configuration', () => {
    it('should return readonly config', () => {
      const client = new TransVoucher({
        apiKey: 'test-api-key-123456789',
        environment: 'sandbox',
        timeout: 5000
      });

      const config = client.getConfig();
      expect(config.apiKey).toBe('test-api-key-123456789');
      expect(config.environment).toBe('sandbox');
      expect(config.timeout).toBe(5000);
    });

    it('should update configuration', () => {
      const client = TransVoucher.sandbox('test-api-key-123456789');
      
      client.updateConfig({ 
        environment: 'production',
        timeout: 10000 
      });

      expect(client.isProduction()).toBe(true);
      expect(client.getConfig().timeout).toBe(10000);
    });
  });

  describe('services access', () => {
    let client: TransVoucher;

    beforeEach(() => {
      client = TransVoucher.sandbox('test-api-key-123456789');
    });

    it('should provide access to payments service', () => {
      expect(client.payments).toBeDefined();
      expect(typeof client.payments.create).toBe('function');
      expect(typeof client.payments.getStatus).toBe('function');
      expect(typeof client.payments.list).toBe('function');
    });

    it('should provide payment utility methods', () => {
      const payment = {
        id: 1,
        amount: 100,
        currency: 'USD',
        status: 'completed' as const,
        title: 'Test Payment'  // Adding required title field
      };

      expect(client.payments.isCompleted(payment)).toBe(true);
      expect(client.payments.isPending(payment)).toBe(false);
      expect(client.payments.isFailed(payment)).toBe(false);
      expect(client.payments.isExpired(payment)).toBe(false);
    });

    it('should provide access to webhooks utilities', () => {
      expect(client.webhooks).toBeDefined();
      expect(typeof client.webhooks.verifySignature).toBe('function');
      expect(typeof client.webhooks.parseEvent).toBe('function');
    });
  });

  describe('payment creation validation', () => {
    let client: TransVoucher;

    beforeEach(() => {
      client = TransVoucher.sandbox('test-api-key-123456789');
    });

    it('should validate required fields', async () => {
      await expect(client.payments.create({
        amount: 0,
        currency: '',
        title: 'Test Payment'  // Adding required title field
      })).rejects.toThrow(ValidationError);
    });

    it('should validate multiple_use field', async () => {
      await expect(client.payments.create({
        amount: 100,
        currency: 'USD',
        title: 'Test Payment',  // Adding required title field
        multiple_use: 'yes' as any
      })).rejects.toThrow(ValidationError);
    });

    it('should accept valid payment creation data', async () => {
      const paymentData = {
        amount: 100,
        currency: 'USD',
        title: 'Test Payment',
        description: 'Test payment description',
        reference_id: 'TEST-001',
        multiple_use: true,
        customer_details: {
          email: 'test@example.com',
          full_name: 'Test User'  // Fix: use full_name instead of name
        }
      };

      // Mock the HTTP client to prevent actual API calls
      client['httpClient'].post = jest.fn().mockResolvedValue({
        success: true,
        data: { ...paymentData, id: 1 }
      });

      const payment = await client.payments.create(paymentData);
      expect(payment.id).toBeDefined();
      expect(payment.multiple_use).toBe(true);
    });
  });
}); 