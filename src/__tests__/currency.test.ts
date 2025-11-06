import { CurrencyService } from '../services/currency';
import { HttpClient } from '../http/client';
import { Currency, ValidationError } from '../types';

// Mock the HttpClient
jest.mock('../http/client');

describe('CurrencyService', () => {
  let currencyService: CurrencyService;
  let mockHttpClient: jest.Mocked<HttpClient>;

  beforeEach(() => {
    mockHttpClient = new HttpClient({
      apiKey: 'test-key',
      apiSecret: 'test-secret-1234567890',
      environment: 'sandbox'
    }) as jest.Mocked<HttpClient>;

    currencyService = new CurrencyService(mockHttpClient);
  });

  describe('all()', () => {
    it('should fetch all currencies successfully', async () => {
      const mockCurrencies: Currency[] = [
        {
          short_code: 'USD',
          name: 'US Dollar',
          symbol: '$',
          current_usd_value: '1.00000000',
          processed_via_currency_code: null
        },
        {
          short_code: 'EUR',
          name: 'Euro',
          symbol: '€',
          current_usd_value: '0.92000000',
          processed_via_currency_code: 'USD'
        },
        {
          short_code: 'GBP',
          name: 'British Pound',
          symbol: '£',
          current_usd_value: '0.79000000',
          processed_via_currency_code: null
        }
      ];

      mockHttpClient.get.mockResolvedValue({
        success: true,
        data: mockCurrencies
      });

      const currencies = await currencyService.all();

      expect(mockHttpClient.get).toHaveBeenCalledWith('/currencies', undefined, undefined);
      expect(currencies).toEqual(mockCurrencies);
      expect(currencies).toHaveLength(3);
      expect(currencies[0].short_code).toBe('USD');
      expect(currencies[1].short_code).toBe('EUR');
      expect(currencies[2].short_code).toBe('GBP');
    });

    it('should handle empty currency list', async () => {
      mockHttpClient.get.mockResolvedValue({
        success: true,
        data: []
      });

      const currencies = await currencyService.all();

      expect(currencies).toEqual([]);
      expect(currencies).toHaveLength(0);
    });

    it('should throw ValidationError on invalid response', async () => {
      mockHttpClient.get.mockResolvedValue({
        success: false
      });

      await expect(currencyService.all()).rejects.toThrow(ValidationError);
      await expect(currencyService.all()).rejects.toThrow('Invalid response from currencies endpoint');
    });
  });

  describe('isProcessedViaAnotherCurrency()', () => {
    it('should return true when currency is processed via another', () => {
      const currency: Currency = {
        short_code: 'EUR',
        name: 'Euro',
        symbol: '€',
        current_usd_value: '0.92000000',
        processed_via_currency_code: 'USD'
      };

      expect(currencyService.isProcessedViaAnotherCurrency(currency)).toBe(true);
    });

    it('should return false when currency is not processed via another', () => {
      const currency: Currency = {
        short_code: 'USD',
        name: 'US Dollar',
        symbol: '$',
        current_usd_value: '1.00000000',
        processed_via_currency_code: null
      };

      expect(currencyService.isProcessedViaAnotherCurrency(currency)).toBe(false);
    });
  });

  describe('findByCode()', () => {
    beforeEach(() => {
      const mockCurrencies: Currency[] = [
        {
          short_code: 'USD',
          name: 'US Dollar',
          symbol: '$',
          current_usd_value: '1.00000000',
          processed_via_currency_code: null
        },
        {
          short_code: 'EUR',
          name: 'Euro',
          symbol: '€',
          current_usd_value: '0.92000000',
          processed_via_currency_code: 'USD'
        }
      ];

      mockHttpClient.get.mockResolvedValue({
        success: true,
        data: mockCurrencies
      });
    });

    it('should find currency by exact code', async () => {
      const currency = await currencyService.findByCode('USD');

      expect(currency).toBeDefined();
      expect(currency?.short_code).toBe('USD');
      expect(currency?.name).toBe('US Dollar');
    });

    it('should find currency by case-insensitive code', async () => {
      const currency = await currencyService.findByCode('eur');

      expect(currency).toBeDefined();
      expect(currency?.short_code).toBe('EUR');
      expect(currency?.name).toBe('Euro');
    });

    it('should return undefined for non-existent currency', async () => {
      const currency = await currencyService.findByCode('XYZ');

      expect(currency).toBeUndefined();
    });
  });

  describe('isSupported()', () => {
    beforeEach(() => {
      const mockCurrencies: Currency[] = [
        {
          short_code: 'USD',
          name: 'US Dollar',
          symbol: '$',
          current_usd_value: '1.00000000',
          processed_via_currency_code: null
        },
        {
          short_code: 'EUR',
          name: 'Euro',
          symbol: '€',
          current_usd_value: '0.92000000',
          processed_via_currency_code: 'USD'
        }
      ];

      mockHttpClient.get.mockResolvedValue({
        success: true,
        data: mockCurrencies
      });
    });

    it('should return true for supported currency', async () => {
      const isSupported = await currencyService.isSupported('USD');

      expect(isSupported).toBe(true);
    });

    it('should return true for supported currency (case-insensitive)', async () => {
      const isSupported = await currencyService.isSupported('eur');

      expect(isSupported).toBe(true);
    });

    it('should return false for unsupported currency', async () => {
      const isSupported = await currencyService.isSupported('XYZ');

      expect(isSupported).toBe(false);
    });
  });
});
