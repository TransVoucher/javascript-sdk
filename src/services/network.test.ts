import { NetworkService } from './network';
import { HttpClient } from '../http/client';
import { Network, ApiResponse } from '../types';

describe('NetworkService', () => {
  let networkService: NetworkService;
  let mockHttpClient: jest.Mocked<HttpClient>;

  const mockNetworks: Network[] = [
    {
      short_code: 'POL',
      identifier: 'polygon',
      name: 'Polygon',
      token_standard: 'ERC-20',
      chain_id: 137,
      explorer_url: 'https://polygonscan.com',
      icon_url: 'https://example.com/polygon.webp',
      is_testnet: false
    },
    {
      short_code: 'ETH',
      identifier: 'ethereum',
      name: 'Ethereum',
      token_standard: 'ERC-20',
      chain_id: 1,
      explorer_url: 'https://etherscan.io',
      icon_url: 'https://example.com/ethereum.webp',
      is_testnet: false
    },
    {
      short_code: 'MATIC_TESTNET',
      identifier: 'polygon-testnet',
      name: 'Polygon Mumbai Testnet',
      token_standard: 'ERC-20',
      chain_id: 80001,
      explorer_url: 'https://mumbai.polygonscan.com',
      icon_url: 'https://example.com/polygon-testnet.webp',
      is_testnet: true
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

    networkService = new NetworkService(mockHttpClient);
  });

  describe('all', () => {
    it('should fetch all networks successfully', async () => {
      const mockResponse: ApiResponse<Network[]> = {
        success: true,
        data: mockNetworks
      };

      mockHttpClient.get.mockResolvedValue(mockResponse);

      const result = await networkService.all();

      expect(mockHttpClient.get).toHaveBeenCalledWith('/networks', undefined, undefined);
      expect(result).toEqual(mockNetworks);
      expect(result).toHaveLength(3);
    });

    it('should pass request options to http client', async () => {
      const mockResponse: ApiResponse<Network[]> = {
        success: true,
        data: mockNetworks
      };

      const options = { timeout: 5000 };
      mockHttpClient.get.mockResolvedValue(mockResponse);

      await networkService.all(options);

      expect(mockHttpClient.get).toHaveBeenCalledWith('/networks', undefined, options);
    });

    it('should throw ValidationError when response is invalid', async () => {
      const mockResponse: ApiResponse<Network[]> = {
        success: false,
        data: undefined
      };

      mockHttpClient.get.mockResolvedValue(mockResponse);

      await expect(networkService.all()).rejects.toThrow('Invalid response from networks endpoint');
    });

    it('should throw ValidationError when data is missing', async () => {
      const mockResponse: ApiResponse<Network[]> = {
        success: true,
        data: undefined
      };

      mockHttpClient.get.mockResolvedValue(mockResponse);

      await expect(networkService.all()).rejects.toThrow('Invalid response from networks endpoint');
    });
  });

  describe('isTestnet', () => {
    it('should return true for testnet networks', () => {
      const testnetNetwork: Network = mockNetworks[2];
      expect(networkService.isTestnet(testnetNetwork)).toBe(true);
    });

    it('should return false for mainnet networks', () => {
      const mainnetNetwork: Network = mockNetworks[0];
      expect(networkService.isTestnet(mainnetNetwork)).toBe(false);
    });

    it('should return false when is_testnet is false', () => {
      const network: Network = {
        ...mockNetworks[0],
        is_testnet: false
      };
      expect(networkService.isTestnet(network)).toBe(false);
    });
  });

  describe('findByCode', () => {
    beforeEach(() => {
      const mockResponse: ApiResponse<Network[]> = {
        success: true,
        data: mockNetworks
      };
      mockHttpClient.get.mockResolvedValue(mockResponse);
    });

    it('should find network by exact short code', async () => {
      const result = await networkService.findByCode('POL');

      expect(result).toBeDefined();
      expect(result?.short_code).toBe('POL');
      expect(result?.name).toBe('Polygon');
    });

    it('should find network by short code (case-insensitive)', async () => {
      const result = await networkService.findByCode('pol');

      expect(result).toBeDefined();
      expect(result?.short_code).toBe('POL');
    });

    it('should find network by uppercase when stored lowercase', async () => {
      const result = await networkService.findByCode('ETH');

      expect(result).toBeDefined();
      expect(result?.short_code).toBe('ETH');
    });

    it('should return undefined for non-existent network', async () => {
      const result = await networkService.findByCode('NONEXISTENT');

      expect(result).toBeUndefined();
    });

    it('should pass request options', async () => {
      const options = { timeout: 5000 };
      await networkService.findByCode('POL', options);

      expect(mockHttpClient.get).toHaveBeenCalledWith('/networks', undefined, options);
    });
  });

  describe('isSupported', () => {
    beforeEach(() => {
      const mockResponse: ApiResponse<Network[]> = {
        success: true,
        data: mockNetworks
      };
      mockHttpClient.get.mockResolvedValue(mockResponse);
    });

    it('should return true for supported network', async () => {
      const result = await networkService.isSupported('POL');
      expect(result).toBe(true);
    });

    it('should return true for supported network (case-insensitive)', async () => {
      const result = await networkService.isSupported('pol');
      expect(result).toBe(true);
    });

    it('should return false for unsupported network', async () => {
      const result = await networkService.isSupported('UNSUPPORTED');
      expect(result).toBe(false);
    });

    it('should pass request options', async () => {
      const options = { timeout: 5000 };
      await networkService.isSupported('POL', options);

      expect(mockHttpClient.get).toHaveBeenCalledWith('/networks', undefined, options);
    });
  });

  describe('getMainnets', () => {
    beforeEach(() => {
      const mockResponse: ApiResponse<Network[]> = {
        success: true,
        data: mockNetworks
      };
      mockHttpClient.get.mockResolvedValue(mockResponse);
    });

    it('should return only mainnet networks', async () => {
      const result = await networkService.getMainnets();

      expect(result).toHaveLength(2);
      expect(result.every(n => !n.is_testnet)).toBe(true);
      expect(result.map(n => n.short_code)).toEqual(['POL', 'ETH']);
    });

    it('should pass request options', async () => {
      const options = { timeout: 5000 };
      await networkService.getMainnets(options);

      expect(mockHttpClient.get).toHaveBeenCalledWith('/networks', undefined, options);
    });
  });

  describe('getTestnets', () => {
    beforeEach(() => {
      const mockResponse: ApiResponse<Network[]> = {
        success: true,
        data: mockNetworks
      };
      mockHttpClient.get.mockResolvedValue(mockResponse);
    });

    it('should return only testnet networks', async () => {
      const result = await networkService.getTestnets();

      expect(result).toHaveLength(1);
      expect(result.every(n => n.is_testnet)).toBe(true);
      expect(result[0].short_code).toBe('MATIC_TESTNET');
    });

    it('should pass request options', async () => {
      const options = { timeout: 5000 };
      await networkService.getTestnets(options);

      expect(mockHttpClient.get).toHaveBeenCalledWith('/networks', undefined, options);
    });
  });
});
