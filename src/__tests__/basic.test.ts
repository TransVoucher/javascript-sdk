import { TransVoucher, ValidationError } from '../index';

describe('TransVoucher Basic Tests', () => {
  test('should create TransVoucher instance', () => {
    const client = new TransVoucher({
      apiKey: 'test-api-key-123456789',
      apiSecret: 'test-secret-1234567890'
    });

    expect(client).toBeInstanceOf(TransVoucher);
  });

  test('should validate API key', () => {
    expect(TransVoucher.validateApiKey('test-api-key-123456789')).toBe(true);
    expect(TransVoucher.validateApiKey('short')).toBe(false);
  });

  test('should create sandbox client', () => {
    const client = TransVoucher.sandbox('test-api-key-123456789', 'test-secret-1234567890');
    expect(client.isSandbox()).toBe(true);
  });

  test('should create production client', () => {
    const client = TransVoucher.production('test-api-key-123456789', 'test-secret-1234567890');
    expect(client.isProduction()).toBe(true);
  });

  test('should have payments service', () => {
    const client = TransVoucher.sandbox('test-api-key-123456789', 'test-secret-1234567890');
    expect(client.payments).toBeDefined();
    expect(client.payments.create).toBeDefined();
  });

  test('should have webhooks utilities', () => {
    const client = TransVoucher.sandbox('test-api-key-123456789', 'test-secret-1234567890');
    expect(client.webhooks).toBeDefined();
    expect(client.webhooks.verifySignature).toBeDefined();
  });
}); 