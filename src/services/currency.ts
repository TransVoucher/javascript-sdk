import { HttpClient } from '../http/client';
import {
  Currency,
  ValidationError,
  RequestOptions
} from '../types';

export class CurrencyService {
  constructor(private httpClient: HttpClient) {}

  /**
   * Get all active processing currencies
   */
  async all(options?: RequestOptions): Promise<Currency[]> {
    const response = await this.httpClient.get<Currency[]>('/currencies', undefined, options);

    if (!response.success || !response.data) {
      throw new ValidationError('Invalid response from currencies endpoint', {});
    }

    return response.data;
  }

  /**
   * Check if a currency is processed via another currency
   */
  isProcessedViaAnotherCurrency(currency: Currency): boolean {
    return currency.processed_via_currency_code !== null && currency.processed_via_currency_code !== undefined;
  }

  /**
   * Get currency by short code
   */
  async findByCode(shortCode: string, options?: RequestOptions): Promise<Currency | undefined> {
    const currencies = await this.all(options);
    return currencies.find(currency => currency.short_code.toUpperCase() === shortCode.toUpperCase());
  }

  /**
   * Check if a currency code is supported
   */
  async isSupported(shortCode: string, options?: RequestOptions): Promise<boolean> {
    const currency = await this.findByCode(shortCode, options);
    return currency !== undefined;
  }
}
