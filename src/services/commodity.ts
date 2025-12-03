import { HttpClient } from '../http/client';
import {
  Commodity,
  ValidationError,
  RequestOptions
} from '../types';

export class CommodityService {
  constructor(private httpClient: HttpClient) {}

  /**
   * Get all active settlement commodities
   */
  async all(options?: RequestOptions): Promise<Commodity[]> {
    const response = await this.httpClient.get<Commodity[]>('/commodities', undefined, options);

    if (!response.success || !response.data) {
      throw new ValidationError('Invalid response from commodities endpoint', {});
    }

    return response.data;
  }

  /**
   * Check if this is a native token (no contract address)
   */
  isNativeToken(commodity: Commodity): boolean {
    return !commodity.contract_address || commodity.contract_address.trim() === '';
  }

  /**
   * Get commodity by short code
   */
  async findByCode(shortCode: string, options?: RequestOptions): Promise<Commodity | undefined> {
    const commodities = await this.all(options);
    return commodities.find(commodity => commodity.short_code.toUpperCase() === shortCode.toUpperCase());
  }

  /**
   * Check if a commodity code is supported
   */
  async isSupported(shortCode: string, options?: RequestOptions): Promise<boolean> {
    const commodity = await this.findByCode(shortCode, options);
    return commodity !== undefined;
  }

  /**
   * Get all commodities for a specific network
   */
  async getByNetwork(networkShortCode: string, options?: RequestOptions): Promise<Commodity[]> {
    const commodities = await this.all(options);
    return commodities.filter(
      commodity => commodity.network_short_code.toUpperCase() === networkShortCode.toUpperCase()
    );
  }

  /**
   * Get all native tokens (currencies without contract addresses)
   */
  async getNativeTokens(options?: RequestOptions): Promise<Commodity[]> {
    const commodities = await this.all(options);
    return commodities.filter(commodity => this.isNativeToken(commodity));
  }

  /**
   * Get all ERC-20/BEP-20 tokens (currencies with contract addresses)
   */
  async getContractTokens(options?: RequestOptions): Promise<Commodity[]> {
    const commodities = await this.all(options);
    return commodities.filter(commodity => !this.isNativeToken(commodity));
  }
}
