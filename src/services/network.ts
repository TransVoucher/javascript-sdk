import { HttpClient } from '../http/client';
import {
  Network,
  ValidationError,
  RequestOptions
} from '../types';

export class NetworkService {
  constructor(private httpClient: HttpClient) {}

  /**
   * Get all active settlement networks
   */
  async all(options?: RequestOptions): Promise<Network[]> {
    const response = await this.httpClient.get<Network[]>('/networks', undefined, options);

    if (!response.success || !response.data) {
      throw new ValidationError('Invalid response from networks endpoint', {});
    }

    return response.data;
  }

  /**
   * Check if this is a testnet
   */
  isTestnet(network: Network): boolean {
    return network.is_testnet === true;
  }

  /**
   * Get network by short code
   */
  async findByCode(shortCode: string, options?: RequestOptions): Promise<Network | undefined> {
    const networks = await this.all(options);
    return networks.find(network => network.short_code.toUpperCase() === shortCode.toUpperCase());
  }

  /**
   * Check if a network code is supported
   */
  async isSupported(shortCode: string, options?: RequestOptions): Promise<boolean> {
    const network = await this.findByCode(shortCode, options);
    return network !== undefined;
  }

  /**
   * Get all mainnet networks (excluding testnets)
   */
  async getMainnets(options?: RequestOptions): Promise<Network[]> {
    const networks = await this.all(options);
    return networks.filter(network => !network.is_testnet);
  }

  /**
   * Get all testnet networks
   */
  async getTestnets(options?: RequestOptions): Promise<Network[]> {
    const networks = await this.all(options);
    return networks.filter(network => network.is_testnet);
  }
}
