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
    reference?: string;
    description?: string;
    customer_email?: string;
    customer_name?: string;
    webhook_url?: string;
    redirect_url?: string;
    metadata?: Record<string, any>;
}
interface Payment {
    id: string;
    amount: number;
    currency: string;
    status: PaymentStatus;
    reference?: string;
    description?: string;
    customer_email?: string;
    customer_name?: string;
    webhook_url?: string;
    redirect_url?: string;
    payment_url?: string;
    qr_code?: string;
    metadata?: Record<string, any>;
    created_at: string;
    updated_at: string;
    expires_at?: string;
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
interface WebhookEvent {
    id: string;
    type: WebhookEventType;
    data: Payment;
    created_at: string;
}
type WebhookEventType = 'payment.created' | 'payment.processing' | 'payment.completed' | 'payment.failed' | 'payment.expired' | 'payment.cancelled';
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
