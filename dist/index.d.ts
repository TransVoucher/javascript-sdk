interface TransVoucherConfig {
    apiKey: string;
    environment?: 'sandbox' | 'production';
    baseUrl?: string;
    timeout?: number;
}
interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: Record<string, string[]>;
}
interface PaginationMeta {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
}
interface PaginatedResponse<T> extends ApiResponse<T> {
    meta?: PaginationMeta;
}
interface CreatePaymentRequest {
    amount: number;
    currency: string;
    title: string;
    description?: string;
    reference_id?: string;
    multiple_use?: boolean;
    customer_details?: CustomerDetails;
    metadata?: Record<string, any>;
    expires_at?: string;
}
interface Payment {
    id?: string;
    transaction_id?: string;
    title: string;
    description?: string;
    reference_id?: string;
    payment_url?: string;
    amount?: number;
    currency?: string;
    status?: PaymentStatus;
    expires_at?: string;
    customer_commission_percentage?: number;
    multiple_use?: boolean;
    created_at?: string;
    updated_at?: string;
    paid_at?: string;
    customer_details?: CustomerDetails;
    metadata?: Record<string, any>;
    payment_details?: Record<string, any>;
}
type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'expired' | 'cancelled';
interface PaymentListRequest {
    page?: number;
    per_page?: number;
    status?: PaymentStatus;
    currency?: string;
    from_date?: string;
    to_date?: string;
    reference?: string;
    customer_email?: string;
}
interface PaymentList {
    payments: Payment[];
    meta: PaginationMeta;
}
interface TransactionData {
    id: string;
    reference_id: string;
    amount: number;
    currency: string;
    status: string;
    payment_method: string;
    created_at: string;
    updated_at: string;
    paid_at?: string;
}
interface SalesChannelData {
    id: string;
    name: string;
    type: string;
}
interface MerchantData {
    id: string;
    name: string;
    company_name: string;
}
interface WebhookEvent {
    event: WebhookEventType;
    timestamp: string;
    data: {
        transaction: TransactionData;
        sales_channel: SalesChannelData;
        merchant: MerchantData;
        payment_details: Record<string, any>;
        customer_details?: CustomerDetails;
        metadata?: Record<string, any>;
    };
}
interface CustomerDetails {
    full_name: string;
    id?: string;
    email?: string;
    phone?: string;
    date_of_birth?: string;
    country_of_residence?: string;
    state_of_residence?: string;
    [key: string]: any;
}
type WebhookEventType = 'payment_intent.created' | 'payment_intent.processing' | 'payment_intent.succeeded' | 'payment_intent.failed' | 'payment_intent.cancelled' | 'payment_intent.expired';
interface WebhookVerificationResult {
    isValid: boolean;
    event?: WebhookEvent;
    error?: string;
}
interface RequestOptions {
    timeout?: number;
    headers?: Record<string, string>;
}
declare class TransVoucherError extends Error {
    readonly code?: string;
    readonly statusCode?: number;
    readonly response?: any;
    constructor(message: string, code?: string, statusCode?: number, response?: any);
}
declare class ValidationError extends TransVoucherError {
    readonly errors: Record<string, string[]>;
    constructor(message: string, errors: Record<string, string[]>, statusCode?: number, response?: any);
}
declare class AuthenticationError extends TransVoucherError {
    constructor(message?: string, statusCode?: number, response?: any);
}
declare class ApiError extends TransVoucherError {
    constructor(message: string, statusCode?: number, response?: any);
}
declare class NetworkError extends TransVoucherError {
    constructor(message: string, originalError?: Error);
}

declare class HttpClient {
    private client;
    private config;
    constructor(config: TransVoucherConfig);
    private createAxiosInstance;
    private getDefaultBaseUrl;
    private handleError;
    get<T = any>(url: string, params?: Record<string, any>, options?: RequestOptions): Promise<ApiResponse<T>>;
    post<T = any>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>>;
    put<T = any>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>>;
    patch<T = any>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>>;
    delete<T = any>(url: string, options?: RequestOptions): Promise<ApiResponse<T>>;
    private buildRequestConfig;
    getBaseUrl(): string;
    updateConfig(newConfig: Partial<TransVoucherConfig>): void;
}

declare class PaymentService {
    private httpClient;
    constructor(httpClient: HttpClient);
    create(data: CreatePaymentRequest, options?: RequestOptions): Promise<Payment>;
    getStatus(paymentId: string, options?: RequestOptions): Promise<Payment>;
    isCompleted(payment: Payment): boolean;
    isPending(payment: Payment): boolean;
    isFailed(payment: Payment): boolean;
    isExpired(payment: Payment): boolean;
    list(params?: PaymentListRequest, options?: RequestOptions): Promise<PaymentList>;
    getByReference(reference: string, options?: RequestOptions): Promise<Payment | null>;
    private validateCreatePaymentRequest;
    private validateListRequest;
    private isValidEmail;
    private isValidUrl;
    private isValidDate;
}

declare class WebhookUtils {
    static verifySignature(payload: string | Buffer, signature: string, secret: string): boolean;
    static parseEvent(payload: string | Buffer, signature: string, secret: string): WebhookVerificationResult;
    static generateSignature(payload: string | Buffer, secret: string): string;
    private static secureCompare;
    private static validateEventStructure;
    static extractSignature(signatureHeader: string): string;
    static isEventRecent(timestamp: string | number, toleranceInSeconds?: number): boolean;
    static createHandler(secret: string, handlers: Partial<Record<string, (event: WebhookEvent) => void | Promise<void>>>): (payload: string | Buffer, signature: string) => Promise<void>;
}

declare class TransVoucher {
    private httpClient;
    private config;
    readonly payments: PaymentService;
    readonly webhooks: typeof WebhookUtils;
    constructor(config: TransVoucherConfig);
    getConfig(): Readonly<TransVoucherConfig>;
    updateConfig(newConfig: Partial<TransVoucherConfig>): void;
    getEnvironment(): 'sandbox' | 'production';
    switchEnvironment(environment: 'sandbox' | 'production'): void;
    getBaseUrl(): string;
    isProduction(): boolean;
    isSandbox(): boolean;
    static validateApiKey(apiKey: string): boolean;
    static sandbox(apiKey: string, options?: Partial<TransVoucherConfig>): TransVoucher;
    static production(apiKey: string, options?: Partial<TransVoucherConfig>): TransVoucher;
    private validateConfig;
}

export { ApiError, type ApiResponse, AuthenticationError, type CreatePaymentRequest, HttpClient, NetworkError, type PaginatedResponse, type PaginationMeta, type Payment, type PaymentList, type PaymentListRequest, PaymentService, type PaymentStatus, type RequestOptions, TransVoucher, type TransVoucherConfig, TransVoucherError, ValidationError, type WebhookEvent, type WebhookEventType, WebhookUtils, type WebhookVerificationResult, TransVoucher as default };
