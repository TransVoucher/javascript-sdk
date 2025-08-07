# TransVoucher TypeScript SDK

Official TypeScript/JavaScript SDK for the TransVoucher payment processing API.

[![npm version](https://badge.fury.io/js/%40transvoucher%2Fsdk.svg)](https://badge.fury.io/js/%40transvoucher%2Fsdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Installation

Install the SDK using npm:

```bash
npm install @transvoucher/sdk
```

Or using yarn:

```bash
yarn add @transvoucher/sdk
```

## Quick Start

```typescript
import TransVoucher from '@transvoucher/sdk';

// Initialize for sandbox
const client = TransVoucher.sandbox('your-api-key');

// Or for production
const client = TransVoucher.production('your-api-key');

// Create a payment
const payment = await client.payments.create({
  amount: 100.00,
  currency: 'USD',
  title: 'Test Payment',
  description: 'Test payment',
  reference_id: 'ORDER-123',
  customer_commission_percentage: 5,
  multiple_use: false,
  customer_details: {
    email: 'customer@example.com',
    name: 'John Doe',
    phone: '+1234567890'
  }
});

console.log('Payment created:', payment.id);
console.log('Payment URL:', payment.payment_url);
```

## Configuration

### Basic Configuration

```typescript
import { TransVoucher } from '@transvoucher/sdk';

const client = new TransVoucher({
  apiKey: 'your-api-key',
  environment: 'sandbox', // or 'production'
  timeout: 30000 // optional, default is 30000ms
});
```

### Environment Switching

```typescript
// Start with sandbox
const client = TransVoucher.sandbox('your-api-key');

// Switch to production
client.switchEnvironment('production');

// Check current environment
if (client.isProduction()) {
  console.log('Running in production mode');
}
```

## API Reference

### Payments

#### Create Payment

```typescript
const payment = await client.payments.create({
  // Required fields
  amount: 100.00,
  currency: 'USD',

  // Optional fields
  title: 'Product Purchase', // optional - title of the payment link
  description: 'Order payment', // optional - description of the payment
  reference_id: 'order-123', // optional - your reference ID
  customer_commission_percentage: 5, // optional - commission percentage for customer (0-100)
  multiple_use: false, // optional - whether the payment link can be used multiple times
  expires_at: '2025-12-31T23:59:59Z', // optional - when the payment link expires
  
  // Customer details (optional)
  customer_details: {
    email: 'customer@example.com',
    name: 'John Doe',
    phone: '+1333999999',
    date_of_birth: '1992-12-21',
    country_of_residence: 'UK'
  },

  // Additional data (optional)
  custom_fields: { // optional custom fields
    order_type: 'subscription',
    product_id: 'PRD-123'
  },
  metadata: { // optional metadata
    order_id: '123',
    user_id: '456'
  }
});

// Helper methods for payment status
if (client.payments.isCompleted(payment)) {
  console.log('Payment is completed');
} else if (client.payments.isPending(payment)) {
  console.log('Payment is pending');
} else if (client.payments.isFailed(payment)) {
  console.log('Payment has failed');
} else if (client.payments.isExpired(payment)) {
  console.log('Payment has expired');
}
```

#### Get Payment Status

```typescript
const payment = await client.payments.getStatus(123); // Note: payment ID is now a number
console.log('Status:', payment.status);
console.log('Amount:', payment.amount);
console.log('Transaction ID:', payment.transaction_id);
console.log('Customer Commission:', payment.customer_commission_percentage);
console.log('Multiple Use:', payment.multiple_use);
```

#### List Payments

```typescript
const result = await client.payments.list({
  page: 1,
  per_page: 10,
  status: 'completed',
  currency: 'USD',
  from_date: '2024-01-01',
  to_date: '2024-12-31',
  customer_email: 'customer@example.com'
});

console.log('Payments:', result.payments);
console.log('Total:', result.meta.total);
```

#### Get Payment by Reference

```typescript
const payment = await client.payments.getByReference('order-123');
if (payment) {
  console.log('Found payment:', payment.id);
}
```

### Webhooks

#### Verify Webhook Signature

```typescript
import { WebhookUtils } from '@transvoucher/sdk';

const isValid = WebhookUtils.verifySignature(
  payload, // string or Buffer
  signature, // from X-TransVoucher-Signature header
  'your-webhook-secret'
);
```

#### Parse Webhook Event

```typescript
const result = WebhookUtils.parseEvent(
  payload,
  signature,
  'your-webhook-secret'
);

if (result.isValid && result.event) {
  console.log('Event type:', result.event.type);
  console.log('Payment data:', result.event.data);
} else {
  console.error('Invalid webhook:', result.error);
}
```

#### Create Webhook Handler

```typescript
const handler = WebhookUtils.createHandler('your-webhook-secret', {
  'payment.completed': async (event) => {
    console.log('Payment completed:', event.data.id);
    // Handle successful payment
  },
  'payment.failed': async (event) => {
    console.log('Payment failed:', event.data.id);
    // Handle failed payment
  }
});

// Use in your webhook endpoint
app.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-transvoucher-signature'];
    await handler(req.body, signature);
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send('Bad Request');
  }
});
```

## Error Handling

The SDK provides specific error types for different scenarios:

```typescript
import { 
  TransVoucherError,
  ValidationError,
  AuthenticationError,
  ApiError,
  NetworkError
} from '@transvoucher/sdk';

try {
  const payment = await client.payments.create({
    amount: 100,
    currency: 'USD'
  });
} catch (error) {
  if (error instanceof ValidationError) {
    console.log('Validation errors:', error.errors);
  } else if (error instanceof AuthenticationError) {
    console.log('Authentication failed');
  } else if (error instanceof ApiError) {
    console.log('API error:', error.message);
    console.log('Status code:', error.statusCode);
  } else if (error instanceof NetworkError) {
    console.log('Network error:', error.message);
  } else {
    console.log('Unknown error:', error);
  }
}
```

## TypeScript Support

The SDK is written in TypeScript and provides full type definitions:

```typescript
import { Payment, PaymentStatus, CreatePaymentRequest } from '@transvoucher/sdk';

const paymentData: CreatePaymentRequest = {
  amount: 100.00,
  currency: 'USD',
  description: 'Test payment'
};

const payment: Payment = await client.payments.create(paymentData);
const status: PaymentStatus = payment.status;
```

## Express.js Webhook Example

```typescript
import express from 'express';
import { WebhookUtils } from '@transvoucher/sdk';

const app = express();

// Middleware to capture raw body for signature verification
app.use('/webhook', express.raw({ type: 'application/json' }));

app.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-transvoucher-signature'] as string;
    const secret = process.env.TRANSVOUCHER_WEBHOOK_SECRET!;
    
    const result = WebhookUtils.parseEvent(req.body, signature, secret);
    
    if (!result.isValid || !result.event) {
      return res.status(400).json({ error: result.error });
    }
    
    // Handle the event
    switch (result.event.type) {
      case 'payment.completed':
        console.log('Payment completed:', result.event.data.id);
        break;
      case 'payment.failed':
        console.log('Payment failed:', result.event.data.id);
        break;
      default:
        console.log('Unhandled event:', result.event.type);
    }
    
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

## Node.js Compatibility

- Node.js 16.0.0 or higher
- Works with both CommonJS and ES modules
- Full TypeScript support

## Available Payment Statuses

- `pending` - Payment is awaiting processing
- `processing` - Payment is being processed
- `completed` - Payment has been successfully completed
- `failed` - Payment has failed
- `expired` - Payment has expired
- `cancelled` - Payment has been cancelled

## Available Webhook Events

- `payment.created` - Payment was created
- `payment.processing` - Payment is being processed
- `payment.completed` - Payment was completed successfully
- `payment.failed` - Payment failed
- `payment.expired` - Payment expired
- `payment.cancelled` - Payment was cancelled

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## Support

- **Documentation**: [https://transvoucher.com/api-documentation](https://transvoucher.com/api-documentation)
- **Email**: developers@transvoucher.com
- **Telegram**: @kevin_tvoucher

## License

This SDK is released under the MIT License. See [LICENSE](LICENSE) for details. 