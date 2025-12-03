/**
 * TransVoucher SDK Types
 */

export interface TransVoucherConfig {
  apiKey: string;
  apiSecret: string;
  environment?: 'sandbox' | 'production';
  baseUrl?: string;
  timeout?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginationMeta {
  has_more: boolean;
  next_page_token?: string;
  count: number;
}

/**
 * Request parameters for creating a payment link
 */
export interface CreatePaymentRequest {
  amount?: number; // Optional when is_price_dynamic is true
  currency?: string;
  title: string;
  description?: string;
  redirect_url?: string;
  success_url?: string;
  cancel_url?: string;
  metadata?: Record<string, any>;
  customer_details?: CustomerDetails;
  theme?: 'dark' | 'light';
  lang?: 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt' | 'ru' | 'zh' | 'ja' | 'ko' | 'tr' | 'ka';
  expires_at?: string;
  custom_fields?: Record<string, any>;
  multiple_use?: boolean;
  cancel_on_first_fail?: boolean;
  is_price_dynamic?: boolean; // When true, allows customers to set their own amount
  [key: string]: any; // Allow additional custom properties
}

/**
 * Payment object returned by the API
 */
export interface Payment {
  id: string;
  reference_id: string;
  flow_type?: string;
  transaction_id?: string;
  payment_link_id?: string;
  payment_url?: string;
  embed_url?: string;
  title?: string;
  description?: string;
  amount: number;
  currency: string;
  fiat_base_amount?: number;
  fiat_total_amount?: number;
  fiat_currency?: string;
  commodity?: string;
  commodity_amount?: number;
  settled_amount?: number;
  metadata?: Record<string, any>;
  customer_details?: CustomerDetails;
  status: PaymentStatus;
  fail_reason?: string;
  created_at?: string;
  updated_at?: string;
  paid_at?: string;
  payment_method?: {
    card_id?: string;
    card_brand?: string;
    payment_type?: string;
    processed_through?: string;
  };
  payment_details?: Record<string, any>;
  blockchain_tx_hash?: string | null;
  [key: string]: any; // Allow additional custom properties
}

export type PaymentStatus = 
  | 'pending'
  | 'attempting'
  | 'processing' 
  | 'completed'
  | 'failed'
  | 'expired'
  | 'cancelled';

export interface PaymentListRequest {
  limit?: number;
  page_token?: string;
  status?: PaymentStatus;
  from_date?: string;
  to_date?: string;
}

export interface PaymentList {
  payments: Payment[];
  has_more: boolean;
  next_page_token?: string;
  count: number;
}

export interface TransactionData {
  id: string;
  reference_id: string;
  fiat_base_amount: number;
  fiat_total_amount: number;
  fiat_currency: string;
  commodity_amount: number;
  settled_amount?: number;
  commodity: string;
  network: string;
  status: PaymentStatus;
  created_at: string;
  updated_at: string;
  paid_at?: string;
  blockchain_tx_hash?: string | null;
}

export interface SalesChannelData {
  id: string;
  name: string;
  type: string;
}

export interface MerchantData {
  id: string;
  company_name: string;
}

export interface WebhookEvent {
  event: WebhookEventType;
  timestamp: string;
  data: {
    payment_link_id?: string;
    transaction: TransactionData;
    sales_channel: SalesChannelData;
    merchant: MerchantData;
    payment_details?: Record<string, any>;
    customer_details?: CustomerDetails;
    metadata?: Record<string, any>;
    fail_reason?: string;
  };
}

export interface CustomerDetails {
  id?: string;
  email?: string;
  phone?: string;
  full_name?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  date_of_birth?: string;
  country_of_residence?: string;
  state_of_residence?: string;
  card_country_code?: string;
  card_state_code?: string;
  card_city?: string;
  card_post_code?: string;
  card_street?: string;
}

export type WebhookEventType = 
  | 'payment_intent.created'
  | 'payment_intent.attempting'
  | 'payment_intent.processing'
  | 'payment_intent.succeeded'
  | 'payment_intent.failed'
  | 'payment_intent.cancelled'
  | 'payment_intent.expired';

export interface WebhookVerificationResult {
  isValid: boolean;
  event?: WebhookEvent;
  error?: string;
}

export interface RequestOptions {
  timeout?: number;
  headers?: Record<string, string>;
}

export class TransVoucherError extends Error {
  public readonly code?: string;
  public readonly statusCode?: number;
  public readonly response?: any;

  constructor(
    message: string,
    code?: string,
    statusCode?: number,
    response?: any
  ) {
    super(message);
    this.name = 'TransVoucherError';
    this.code = code;
    this.statusCode = statusCode;
    this.response = response;
  }
}

export class ValidationError extends TransVoucherError {
  public readonly errors: Record<string, string[]>;

  constructor(
    message: string,
    errors: Record<string, string[]>,
    statusCode?: number,
    response?: any
  ) {
    super(message, 'VALIDATION_ERROR', statusCode, response);
    this.name = 'ValidationError';
    this.errors = errors;
  }
}

export class AuthenticationError extends TransVoucherError {
  constructor(message: string = 'Authentication failed', statusCode?: number, response?: any) {
    super(message, 'AUTHENTICATION_ERROR', statusCode, response);
    this.name = 'AuthenticationError';
  }
}

export class ApiError extends TransVoucherError {
  constructor(message: string, statusCode?: number, response?: any) {
    super(message, 'API_ERROR', statusCode, response);
    this.name = 'ApiError';
  }
}

export class NetworkError extends TransVoucherError {
  constructor(message: string, originalError?: Error) {
    super(message, 'NETWORK_ERROR');
    this.name = 'NetworkError';
    if (originalError) {
      this.stack = originalError.stack;
    }
  }
}

/**
 * Currency object returned by the API
 */
export interface Currency {
  short_code: string;
  name: string;
  symbol: string;
  current_usd_value: string;
  processed_via_currency_code: string | null;
}

/**
 * Network object returned by the API (blockchain network)
 */
export interface Network {
  short_code: string;
  identifier: string;
  name: string;
  token_standard: string | null;
  chain_id: number | null;
  explorer_url: string | null;
  icon_url: string | null;
  is_testnet: boolean;
}

/**
 * Commodity object returned by the API (cryptocurrency)
 */
export interface Commodity {
  short_code: string;
  name: string;
  icon_url: string | null;
  current_usd_value: string;
  contract_address: string | null;
  decimals: number;
  network_short_code: string;
}

/**
 * Conversion rate response
 */
export interface ConversionRate {
  rate: string;
}