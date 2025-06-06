"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  ApiError: () => ApiError,
  AuthenticationError: () => AuthenticationError,
  HttpClient: () => HttpClient,
  NetworkError: () => NetworkError,
  PaymentService: () => PaymentService,
  TransVoucher: () => TransVoucher,
  TransVoucherError: () => TransVoucherError,
  ValidationError: () => ValidationError,
  WebhookUtils: () => WebhookUtils,
  default: () => index_default
});
module.exports = __toCommonJS(index_exports);

// src/http/client.ts
var import_axios = __toESM(require("axios"));

// src/types.ts
var TransVoucherError = class extends Error {
  constructor(message, code, statusCode, response) {
    super(message);
    this.name = "TransVoucherError";
    this.code = code;
    this.statusCode = statusCode;
    this.response = response;
  }
};
var ValidationError = class extends TransVoucherError {
  constructor(message, errors, statusCode, response) {
    super(message, "VALIDATION_ERROR", statusCode, response);
    this.name = "ValidationError";
    this.errors = errors;
  }
};
var AuthenticationError = class extends TransVoucherError {
  constructor(message = "Authentication failed", statusCode, response) {
    super(message, "AUTHENTICATION_ERROR", statusCode, response);
    this.name = "AuthenticationError";
  }
};
var ApiError = class extends TransVoucherError {
  constructor(message, statusCode, response) {
    super(message, "API_ERROR", statusCode, response);
    this.name = "ApiError";
  }
};
var NetworkError = class extends TransVoucherError {
  constructor(message, originalError) {
    super(message, "NETWORK_ERROR");
    this.name = "NetworkError";
    if (originalError) {
      this.stack = originalError.stack;
    }
  }
};

// src/http/client.ts
var HttpClient = class {
  constructor(config) {
    this.config = config;
    this.client = this.createAxiosInstance();
  }
  createAxiosInstance() {
    const baseURL = this.config.baseUrl || this.getDefaultBaseUrl();
    const instance = import_axios.default.create({
      baseURL,
      timeout: this.config.timeout || 3e4,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${this.config.apiKey}`,
        "User-Agent": "TransVoucher-TypeScript-SDK/1.0.0"
      }
    });
    instance.interceptors.request.use(
      (config) => {
        return config;
      },
      (error) => {
        return Promise.reject(this.handleError(error));
      }
    );
    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        return Promise.reject(this.handleError(error));
      }
    );
    return instance;
  }
  getDefaultBaseUrl() {
    const subdomain = this.config.environment === "production" ? "api" : "api-sandbox";
    return `https://${subdomain}.transvoucher.com/v1`;
  }
  handleError(error) {
    if (error.response) {
      const { status, data } = error.response;
      const message = data?.message || error.message || "An API error occurred";
      switch (status) {
        case 401:
          return new AuthenticationError(message, status, data);
        case 422:
          return new ValidationError(
            message,
            data?.errors || {},
            status,
            data
          );
        case 400:
        case 403:
        case 404:
        case 409:
        case 429:
          return new ApiError(message, status, data);
        default:
          return new TransVoucherError(message, "API_ERROR", status, data);
      }
    } else if (error.request) {
      return new NetworkError("Network error: No response received", error);
    } else {
      return new NetworkError(`Request error: ${error.message}`, error);
    }
  }
  async get(url, params, options) {
    try {
      const config = {
        params,
        ...this.buildRequestConfig(options)
      };
      const response = await this.client.get(url, config);
      return response.data;
    } catch (error) {
      throw error instanceof TransVoucherError ? error : this.handleError(error);
    }
  }
  async post(url, data, options) {
    try {
      const config = this.buildRequestConfig(options);
      const response = await this.client.post(url, data, config);
      return response.data;
    } catch (error) {
      throw error instanceof TransVoucherError ? error : this.handleError(error);
    }
  }
  async put(url, data, options) {
    try {
      const config = this.buildRequestConfig(options);
      const response = await this.client.put(url, data, config);
      return response.data;
    } catch (error) {
      throw error instanceof TransVoucherError ? error : this.handleError(error);
    }
  }
  async patch(url, data, options) {
    try {
      const config = this.buildRequestConfig(options);
      const response = await this.client.patch(url, data, config);
      return response.data;
    } catch (error) {
      throw error instanceof TransVoucherError ? error : this.handleError(error);
    }
  }
  async delete(url, options) {
    try {
      const config = this.buildRequestConfig(options);
      const response = await this.client.delete(url, config);
      return response.data;
    } catch (error) {
      throw error instanceof TransVoucherError ? error : this.handleError(error);
    }
  }
  buildRequestConfig(options) {
    const config = {};
    if (options?.timeout) {
      config.timeout = options.timeout;
    }
    if (options?.headers) {
      config.headers = { ...config.headers, ...options.headers };
    }
    return config;
  }
  getBaseUrl() {
    return this.client.defaults.baseURL || "";
  }
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.client = this.createAxiosInstance();
  }
};

// src/services/payment.ts
var PaymentService = class {
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  /**
   * Create a new payment
   */
  async create(data, options) {
    this.validateCreatePaymentRequest(data);
    const response = await this.httpClient.post("/payments", data, options);
    if (!response.success || !response.data) {
      throw new ValidationError("Invalid response from payment creation", {});
    }
    return response.data;
  }
  /**
   * Get payment status by ID
   */
  async getStatus(paymentId, options) {
    if (!paymentId || typeof paymentId !== "string") {
      throw new ValidationError("Payment ID is required and must be a string", {
        paymentId: ["Payment ID is required and must be a string"]
      });
    }
    const response = await this.httpClient.get(`/payments/${paymentId}`, void 0, options);
    if (!response.success || !response.data) {
      throw new ValidationError("Invalid response from payment status check", {});
    }
    return response.data;
  }
  /**
   * List payments with optional filters
   */
  async list(params = {}, options) {
    this.validateListRequest(params);
    const queryParams = {};
    if (params.page !== void 0) queryParams.page = params.page;
    if (params.per_page !== void 0) queryParams.per_page = params.per_page;
    if (params.status) queryParams.status = params.status;
    if (params.currency) queryParams.currency = params.currency;
    if (params.from_date) queryParams.from_date = params.from_date;
    if (params.to_date) queryParams.to_date = params.to_date;
    if (params.reference) queryParams.reference = params.reference;
    if (params.customer_email) queryParams.customer_email = params.customer_email;
    const response = await this.httpClient.get("/payments", queryParams, options);
    if (!response.success || !response.data) {
      throw new ValidationError("Invalid response from payment list", {});
    }
    return response.data;
  }
  /**
   * Get payment by reference
   */
  async getByReference(reference, options) {
    if (!reference || typeof reference !== "string") {
      throw new ValidationError("Reference is required and must be a string", {
        reference: ["Reference is required and must be a string"]
      });
    }
    const response = await this.list({ reference }, options);
    return response.payments.length > 0 ? response.payments[0] : null;
  }
  validateCreatePaymentRequest(data) {
    const errors = {};
    if (!data.amount) {
      errors.amount = ["Amount is required"];
    } else if (typeof data.amount !== "number" || data.amount <= 0) {
      errors.amount = ["Amount must be a positive number"];
    }
    if (!data.currency) {
      errors.currency = ["Currency is required"];
    } else if (typeof data.currency !== "string" || data.currency.length !== 3) {
      errors.currency = ["Currency must be a 3-character string (e.g., USD, EUR)"];
    }
    if (data.customer_email && !this.isValidEmail(data.customer_email)) {
      errors.customer_email = ["Customer email must be a valid email address"];
    }
    if (data.webhook_url && !this.isValidUrl(data.webhook_url)) {
      errors.webhook_url = ["Webhook URL must be a valid URL"];
    }
    if (data.redirect_url && !this.isValidUrl(data.redirect_url)) {
      errors.redirect_url = ["Redirect URL must be a valid URL"];
    }
    if (data.reference && (typeof data.reference !== "string" || data.reference.length > 255)) {
      errors.reference = ["Reference must be a string with maximum 255 characters"];
    }
    if (data.description && (typeof data.description !== "string" || data.description.length > 1e3)) {
      errors.description = ["Description must be a string with maximum 1000 characters"];
    }
    if (data.customer_name && (typeof data.customer_name !== "string" || data.customer_name.length > 255)) {
      errors.customer_name = ["Customer name must be a string with maximum 255 characters"];
    }
    if (Object.keys(errors).length > 0) {
      throw new ValidationError("Validation failed", errors);
    }
  }
  validateListRequest(params) {
    const errors = {};
    if (params.page !== void 0 && (!Number.isInteger(params.page) || params.page < 1)) {
      errors.page = ["Page must be a positive integer"];
    }
    if (params.per_page !== void 0 && (!Number.isInteger(params.per_page) || params.per_page < 1 || params.per_page > 100)) {
      errors.per_page = ["Per page must be an integer between 1 and 100"];
    }
    if (params.status && !["pending", "processing", "completed", "failed", "expired", "cancelled"].includes(params.status)) {
      errors.status = ["Status must be one of: pending, processing, completed, failed, expired, cancelled"];
    }
    if (params.currency && (typeof params.currency !== "string" || params.currency.length !== 3)) {
      errors.currency = ["Currency must be a 3-character string"];
    }
    if (params.from_date && !this.isValidDate(params.from_date)) {
      errors.from_date = ["From date must be a valid date in YYYY-MM-DD format"];
    }
    if (params.to_date && !this.isValidDate(params.to_date)) {
      errors.to_date = ["To date must be a valid date in YYYY-MM-DD format"];
    }
    if (params.customer_email && !this.isValidEmail(params.customer_email)) {
      errors.customer_email = ["Customer email must be a valid email address"];
    }
    if (Object.keys(errors).length > 0) {
      throw new ValidationError("Validation failed", errors);
    }
  }
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
  isValidDate(date) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) return false;
    const parsedDate = new Date(date);
    return parsedDate instanceof Date && !isNaN(parsedDate.getTime());
  }
};

// src/utils/webhook.ts
var crypto = __toESM(require("crypto"));
var WebhookUtils = class {
  /**
   * Verify webhook signature
   */
  static verifySignature(payload, signature, secret) {
    try {
      const expectedSignature = this.generateSignature(payload, secret);
      return this.secureCompare(signature, expectedSignature);
    } catch (error) {
      return false;
    }
  }
  /**
   * Parse and verify webhook event
   */
  static parseEvent(payload, signature, secret) {
    try {
      if (!this.verifySignature(payload, signature, secret)) {
        return {
          isValid: false,
          error: "Invalid webhook signature"
        };
      }
      const payloadString = typeof payload === "string" ? payload : payload.toString("utf8");
      const eventData = JSON.parse(payloadString);
      const validationResult = this.validateEventStructure(eventData);
      if (!validationResult.isValid) {
        return validationResult;
      }
      return {
        isValid: true,
        event: eventData
      };
    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : "Failed to parse webhook event"
      };
    }
  }
  /**
   * Generate webhook signature
   */
  static generateSignature(payload, secret) {
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(payload);
    return `sha256=${hmac.digest("hex")}`;
  }
  /**
   * Secure string comparison to prevent timing attacks
   */
  static secureCompare(a, b) {
    if (a.length !== b.length) {
      return false;
    }
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }
  /**
   * Validate webhook event structure
   */
  static validateEventStructure(eventData) {
    if (!eventData || typeof eventData !== "object") {
      return {
        isValid: false,
        error: "Event data must be an object"
      };
    }
    if (!eventData.id || typeof eventData.id !== "string") {
      return {
        isValid: false,
        error: "Event must have a valid ID"
      };
    }
    if (!eventData.type || typeof eventData.type !== "string") {
      return {
        isValid: false,
        error: "Event must have a valid type"
      };
    }
    const validEventTypes = [
      "payment.created",
      "payment.processing",
      "payment.completed",
      "payment.failed",
      "payment.expired",
      "payment.cancelled"
    ];
    if (!validEventTypes.includes(eventData.type)) {
      return {
        isValid: false,
        error: `Invalid event type: ${eventData.type}`
      };
    }
    if (!eventData.data || typeof eventData.data !== "object") {
      return {
        isValid: false,
        error: "Event must have valid data"
      };
    }
    if (!eventData.created_at || typeof eventData.created_at !== "string") {
      return {
        isValid: false,
        error: "Event must have a valid created_at timestamp"
      };
    }
    const paymentData = eventData.data;
    if (!paymentData.id || typeof paymentData.id !== "string") {
      return {
        isValid: false,
        error: "Payment data must have a valid ID"
      };
    }
    if (typeof paymentData.amount !== "number" || paymentData.amount <= 0) {
      return {
        isValid: false,
        error: "Payment data must have a valid amount"
      };
    }
    if (!paymentData.currency || typeof paymentData.currency !== "string") {
      return {
        isValid: false,
        error: "Payment data must have a valid currency"
      };
    }
    if (!paymentData.status || typeof paymentData.status !== "string") {
      return {
        isValid: false,
        error: "Payment data must have a valid status"
      };
    }
    return { isValid: true };
  }
  /**
   * Extract signature from header
   */
  static extractSignature(signatureHeader) {
    if (!signatureHeader) {
      throw new TransVoucherError("Signature header is required");
    }
    if (signatureHeader.startsWith("sha256=")) {
      return signatureHeader;
    }
    const parts = signatureHeader.split(",");
    for (const part of parts) {
      if (part.startsWith("v1=")) {
        return `sha256=${part.substring(3)}`;
      }
    }
    throw new TransVoucherError("Invalid signature header format");
  }
  /**
   * Check if webhook event is recent (within tolerance)
   */
  static isEventRecent(timestamp, toleranceInSeconds = 300) {
    try {
      const eventTime = typeof timestamp === "string" ? new Date(timestamp).getTime() : timestamp * 1e3;
      const currentTime = Date.now();
      const timeDifference = Math.abs(currentTime - eventTime) / 1e3;
      return timeDifference <= toleranceInSeconds;
    } catch {
      return false;
    }
  }
  /**
   * Create a webhook event handler function
   */
  static createHandler(secret, handlers) {
    return async (payload, signature) => {
      const result = this.parseEvent(payload, signature, secret);
      if (!result.isValid || !result.event) {
        throw new TransVoucherError(result.error || "Invalid webhook event");
      }
      const handler = handlers[result.event.type];
      if (handler) {
        await handler(result.event);
      }
    };
  }
};

// src/transvoucher.ts
var TransVoucher = class _TransVoucher {
  constructor(config) {
    this.webhooks = WebhookUtils;
    this.validateConfig(config);
    this.config = { ...config };
    this.httpClient = new HttpClient(this.config);
    this.payments = new PaymentService(this.httpClient);
  }
  /**
   * Get current configuration
   */
  getConfig() {
    return { ...this.config };
  }
  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    if (newConfig.apiKey !== void 0 || newConfig.environment !== void 0 || newConfig.baseUrl !== void 0) {
      const updatedConfig = { ...this.config, ...newConfig };
      this.validateConfig(updatedConfig);
      this.config = updatedConfig;
      this.httpClient.updateConfig(updatedConfig);
    } else {
      this.config = { ...this.config, ...newConfig };
    }
  }
  /**
   * Get the current environment
   */
  getEnvironment() {
    return this.config.environment || "sandbox";
  }
  /**
   * Switch environment
   */
  switchEnvironment(environment) {
    this.updateConfig({ environment });
  }
  /**
   * Get current base URL
   */
  getBaseUrl() {
    return this.httpClient.getBaseUrl();
  }
  /**
   * Check if SDK is configured for production
   */
  isProduction() {
    return this.getEnvironment() === "production";
  }
  /**
   * Check if SDK is configured for sandbox
   */
  isSandbox() {
    return this.getEnvironment() === "sandbox";
  }
  /**
   * Validate API key format
   */
  static validateApiKey(apiKey) {
    if (!apiKey || typeof apiKey !== "string") {
      return false;
    }
    return apiKey.trim().length >= 10;
  }
  /**
   * Create a new TransVoucher instance for sandbox
   */
  static sandbox(apiKey, options) {
    return new _TransVoucher({
      apiKey,
      environment: "sandbox",
      ...options
    });
  }
  /**
   * Create a new TransVoucher instance for production
   */
  static production(apiKey, options) {
    return new _TransVoucher({
      apiKey,
      environment: "production",
      ...options
    });
  }
  validateConfig(config) {
    const errors = {};
    if (!config.apiKey) {
      errors.apiKey = ["API key is required"];
    } else if (typeof config.apiKey !== "string") {
      errors.apiKey = ["API key must be a string"];
    } else if (!_TransVoucher.validateApiKey(config.apiKey)) {
      errors.apiKey = ["API key format is invalid"];
    }
    if (config.environment && !["sandbox", "production"].includes(config.environment)) {
      errors.environment = ['Environment must be either "sandbox" or "production"'];
    }
    if (config.baseUrl) {
      try {
        new URL(config.baseUrl);
      } catch {
        errors.baseUrl = ["Base URL must be a valid URL"];
      }
    }
    if (config.timeout !== void 0) {
      if (typeof config.timeout !== "number" || config.timeout <= 0) {
        errors.timeout = ["Timeout must be a positive number"];
      }
    }
    if (Object.keys(errors).length > 0) {
      throw new ValidationError("Invalid configuration", errors);
    }
  }
};

// src/index.ts
var index_default = TransVoucher;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ApiError,
  AuthenticationError,
  HttpClient,
  NetworkError,
  PaymentService,
  TransVoucher,
  TransVoucherError,
  ValidationError,
  WebhookUtils
});
