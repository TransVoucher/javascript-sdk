import { CommodityService } from './commodity';
import { HttpClient } from '../http/client';
import { Commodity, ApiResponse } from '../types';

describe('CommodityService', () => {
  let commodityService: CommodityService;
  let mockHttpClient: jest.Mocked<HttpClient>;

  const mockCommodities: Commodity[] = [
    {
      short_code: 'USDT',
      name: 'Tether USD',
      icon_url: 'https://example.com/usdt.webp',
      current_usd_value: '1.00',
      contract_address: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
      decimals: 6,
      network_short_code: 'POL'
    },
    {
      short_code: 'USDC',
      name: 'USD Coin',
      icon_url: 'https://example.com/usdc.webp',
      current_usd_value: '1.00',
      contract_address: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
      decimals: 6,
      network_short_code: 'POL'
    },
    {
      short_code: 'MATIC',
      name: 'Polygon',
      icon_url: 'https://example.com/matic.webp',
      current_usd_value: '0.85',
      contract_address: null,
      decimals: 18,
      network_short_code: 'POL'
    },
    {
      short_code: 'USDT',
      name: 'Tether USD',
      icon_url: 'https://example.com/usdt-eth.webp',
      current_usd_value: '1.00',
      contract_address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      decimals: 6,
      network_short_code: 'ETH'
    }
  ];

  beforeEach(() => {
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      getBaseUrl: jest.fn(),
      updateConfig: jest.fn()
    } as any;

    commodityService = new CommodityService(mockHttpClient);
  });

  describe('all', () => {
    it('should fetch all commodities successfully', async () => {
      const mockResponse: ApiResponse<Commodity[]> = {
        success: true,
        data: mockCommodities
      };

      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await commodityService.all();

      expect(mockHttpClient.get).toHaveBeenCalledWith('/commodities', undefined, undefined);
      expect(result).toEqual(mockCommodities);
      expect(result).toHaveLength(4);
    });

    it('should pass request options to http client', async () => {
      const mockResponse: ApiResponse<Commodity[]> = {
        success: true,
        data: mockCommodities
      };

      const options = { timeout: 5000 };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      await commodityService.all(options);

      expect(mockHttpClient.get).toHaveBeenCalledWith('/commodities', undefined, options);
    });

    it('should throw ValidationError when response is invalid', async () => {
      const mockResponse: ApiResponse<Commodity[]> = {
        success: false,
        data: undefined
      };

      mockHttpClient.get.mockResolvedValue(mockResponse);

      await expect(commodityService.all()).rejects.toThrow('Invalid response from commodities endpoint');
    });

    it('should throw ValidationError when data is missing', async () => {
      const mockResponse: ApiResponse<Commodity[]> = {
        success: true,
        data: undefined
      };

      mockHttpClient.get.mockResolvedValue(mockResponse);

      await expect(commodityService.all()).rejects.toThrow('Invalid response from commodities endpoint');
    });
  });

  describe('isNativeToken', () => {
    it('should return true for native tokens (no contract address)', () => {
      const nativeToken = mockCommodities[2]; // MATIC
      expect(commodityService.isNativeToken(nativeToken)).toBe(true);
    });

    it('should return false for contract tokens', () => {
      const contractToken = mockCommodities[0]; // USDT
      expect(commodityService.isNativeToken(contractToken)).toBe(false);
    });

    it('should return true when contract_address is null', () => {
      const commodity: Commodity = {
        ...mockCommodities[0],
        contract_address: null
      };
      expect(commodityService.isNativeToken(commodity)).toBe(true);
    });

    it('should return true when contract_address is empty string', () => {
      const commodity: Commodity = {
        ...mockCommodities[0],
        contract_address: ''
      };
      expect(commodityService.isNativeToken(commodity)).toBe(true);
    });
  });

  describe('findByCode', () => {
    beforeEach(() => {
      const mockResponse: ApiResponse<Commodity[]> = {
        success: true,
        data: mockCommodities
      };
      mockHttpClient.get.mockResolvedValue(mockResponse);
    });

    it('should find first commodity by exact short code', async () => {
      const result = await commodityService.findByCode('USDT');

      expect(result).toBeDefined();
      expect(result?.short_code).toBe('USDT');
      expect(result?.network_short_code).toBe('POL');
    });

    it('should find commodity by short code (case-insensitive)', async () => {
      const result = await commodityService.findByCode('usdt');

      expect(result).toBeDefined();
      expect(result?.short_code).toBe('USDT');
    });

    it('should find native token by short code', async () => {
      const result = await commodityService.findByCode('MATIC');

      expect(result).toBeDefined();
      expect(result?.short_code).toBe('MATIC');
      expect(result?.contract_address).toBeNull();
    });

    it('should return undefined for non-existent commodity', async () => {
      const result = await commodityService.findByCode('NONEXISTENT');

      expect(result).toBeUndefined();
    });

    it('should pass request options', async () => {
      const options = { timeout: 5000 };
      await commodityService.findByCode('USDT', options);

      expect(mockHttpClient.get).toHaveBeenCalledWith('/commodities', undefined, options);
    });
  });

  describe('isSupported', () => {
    beforeEach(() => {
      const mockResponse: ApiResponse<Commodity[]> = {
        success: true,
        data: mockCommodities
      };
      mockHttpClient.get.mockResolvedValue(mockResponse);
    });

    it('should return true for supported commodity', async () => {
      const result = await commodityService.isSupported('USDT');
      expect(result).toBe(true);
    });

    it('should return true for supported commodity (case-insensitive)', async () => {
      const result = await commodityService.isSupported('usdt');
      expect(result).toBe(true);
    });

    it('should return false for unsupported commodity', async () => {
      const result = await commodityService.isSupported('UNSUPPORTED');
      expect(result).toBe(false);
    });

    it('should return true for native tokens', async () => {
      const result = await commodityService.isSupported('MATIC');
      expect(result).toBe(true);
    });

    it('should pass request options', async () => {
      const options = { timeout: 5000 };
      await commodityService.isSupported('USDT', options);

      expect(mockHttpClient.get).toHaveBeenCalledWith('/commodities', undefined, options);
    });
  });

  describe('getByNetwork', () => {
    beforeEach(() => {
      const mockResponse: ApiResponse<Commodity[]> = {
        success: true,
        data: mockCommodities
      };
      mockHttpClient.get.mockResolvedValue(mockResponse);
    });

    it('should return commodities for specific network', async () => {
      const result = await commodityService.getByNetwork('POL');

      expect(result).toHaveLength(3);
      expect(result.every(c => c.network_short_code === 'POL')).toBe(true);
    });

    it('should filter by network (case-insensitive)', async () => {
      const result = await commodityService.getByNetwork('pol');

      expect(result).toHaveLength(3);
      expect(result.every(c => c.network_short_code === 'POL')).toBe(true);
    });

    it('should return empty array for network with no commodities', async () => {
      const result = await commodityService.getByNetwork('NONEXISTENT');

      expect(result).toEqual([]);
    });

    it('should pass request options', async () => {
      const options = { timeout: 5000 };
      await commodityService.getByNetwork('POL', options);

      expect(mockHttpClient.get).toHaveBeenCalledWith('/commodities', undefined, options);
    });
  });

  describe('getNativeTokens', () => {
    beforeEach(() => {
      const mockResponse: ApiResponse<Commodity[]> = {
        success: true,
        data: mockCommodities
      };
      mockHttpClient.get.mockResolvedValue(mockResponse);
    });

    it('should return only native tokens', async () => {
      const result = await commodityService.getNativeTokens();

      expect(result).toHaveLength(1);
      expect(result[0].short_code).toBe('MATIC');
      expect(result[0].contract_address).toBeNull();
    });

    it('should pass request options', async () => {
      const options = { timeout: 5000 };
      await commodityService.getNativeTokens(options);

      expect(mockHttpClient.get).toHaveBeenCalledWith('/commodities', undefined, options);
    });
  });

  describe('getContractTokens', () => {
    beforeEach(() => {
      const mockResponse: ApiResponse<Commodity[]> = {
        success: true,
        data: mockCommodities
      };
      mockHttpClient.get.mockResolvedValue(mockResponse);
    });

    it('should return only contract tokens', async () => {
      const result = await commodityService.getContractTokens();

      expect(result).toHaveLength(3);
      expect(result.every(c => c.contract_address !== null)).toBe(true);
    });

    it('should pass request options', async () => {
      const options = { timeout: 5000 };
      await commodityService.getContractTokens(options);

      expect(mockHttpClient.get).toHaveBeenCalledWith('/commodities', undefined, options);
    });
  });
});
