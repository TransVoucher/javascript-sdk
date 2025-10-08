# Using TransVoucher SDK in JavaScript Projects

The TransVoucher TypeScript SDK works perfectly in regular JavaScript projects! Here are examples showing different ways to use it.

## Installation

```bash
npm install @transvoucher/sdk
```

## CommonJS (Traditional Node.js)

### Basic Payment Creation
```javascript
// payment-example.js
const TransVoucher = require('@transvoucher/sdk').default;

async function createPayment() {
  try {
    // Initialize client for sandbox
    const client = TransVoucher.sandbox('your-api-key-here');
    
    // Create a payment
    const payment = await client.payments.create({
      amount: 100.00,
      currency: 'USD',
      description: 'Test payment from JavaScript',
    });

    console.log('✅ Payment created!');
    console.log('Payment ID:', payment.id);
    console.log('Payment URL:', payment.payment_url);
    console.log('Status:', payment.status);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    
    // Handle specific error types
    if (error.name === 'ValidationError') {
      console.error('Validation errors:', error.errors);
    }
  }
}

createPayment();
```

### Check Payment Status
```javascript
// check-status.js
const TransVoucher = require('@transvoucher/sdk').default;

async function checkPaymentStatus(transactionId) {
  const client = TransVoucher.sandbox('your-api-key-here');
  
  try {
    const payment = await client.payments.getTransactionStatus(transactionId);
    
    console.log('Payment Status:', payment.status);
    console.log('Amount:', payment.amount, payment.currency);
    
    if (payment.status === 'completed') {
      console.log('🎉 Payment completed successfully!');
    }
    
  } catch (error) {
    console.error('Error checking status:', error.message);
  }
}

// Usage: node check-status.js
checkPaymentStatus('your-payment-id-here');
```

### List Payments with Filters
```javascript
// list-payments.js
const TransVoucher = require('@transvoucher/sdk').default;

async function listPayments() {
  const client = TransVoucher.sandbox('your-api-key-here');
  
  try {
    // List completed payments
    const result = await client.payments.list({
      status: 'completed',
      currency: 'USD',
      per_page: 10,
      page: 1
    });
    
    console.log(`Found ${result.meta.total} payments`);
    
    result.payments.forEach((payment, index) => {
      console.log(`${index + 1}. ${payment.id} - $${payment.amount} - ${payment.status}`);
    });
    
  } catch (error) {
    console.error('Error listing payments:', error.message);
  }
}

listPayments();
```

## ES Modules (Modern JavaScript)

### Basic Usage with ES Modules
```javascript
// payment-esm.mjs
import TransVoucher from '@transvoucher/sdk';

async function main() {
  const client = TransVoucher.production('your-production-api-key');
  
  const payment = await client.payments.create({
    amount: 250.00,
    currency: 'EUR',
    description: 'ES Module payment',
    reference: 'order-' + Date.now()
  });
  
  console.log('Payment created:', payment.id);
}

main().catch(console.error);
```

### Destructured Imports
```javascript
// advanced-esm.mjs
import TransVoucher, { ValidationError, WebhookUtils } from '@transvoucher/sdk';

const client = TransVoucher.sandbox('your-api-key');

// Error handling with specific types
try {
  const payment = await client.payments.create({
    amount: -100, // This will fail validation
    currency: 'USD'
  });
} catch (error) {
  if (error instanceof ValidationError) {
    console.log('Validation failed:', error.errors);
  }
}

// Webhook signature verification
const isValid = WebhookUtils.verifySignature(
  'payload',
  'signature', 
  'webhook-secret'
);
console.log('Webhook valid:', isValid);
```

## Express.js Webhook Handler (JavaScript)

```javascript
// webhook-server.js
const express = require('express');
const { WebhookUtils } = require('@transvoucher/sdk');

const app = express();
const WEBHOOK_SECRET = process.env.TRANSVOUCHER_WEBHOOK_SECRET || 'your-secret';

// Raw body middleware for webhook signature verification
app.use('/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

app.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-transvoucher-signature'];
    const payload = req.body;
    
    // Verify and parse webhook
    const result = WebhookUtils.parseEvent(payload, signature, WEBHOOK_SECRET);
    
    if (!result.isValid) {
      console.error('Invalid webhook:', result.error);
      return res.status(400).json({ error: 'Invalid webhook' });
    }
    
    const event = result.event;
    console.log('Received event:', event.type, 'for payment:', event.data.id);
    
    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        console.log('🎉 Payment completed:', event.data.amount, event.data.currency);
        // Add your business logic here
        break;

    // ...
        
      case 'payment_intent.failed':
        console.log('❌ Payment failed:', event.data.id);
        // Handle failed payment
        break;
        
      default:
        console.log('Unhandled event type:', event.type);
    }
    
    res.json({ received: true });
    
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Webhook server running on port ${PORT}`);
});
```

## Environment Configuration

```javascript
// config.js
const TransVoucher = require('@transvoucher/sdk').default;

// Environment-based configuration
const apiKey = process.env.NODE_ENV === 'production' 
  ? process.env.TRANSVOUCHER_PRODUCTION_KEY
  : process.env.TRANSVOUCHER_SANDBOX_KEY;

const client = process.env.NODE_ENV === 'production'
  ? TransVoucher.production(apiKey)
  : TransVoucher.sandbox(apiKey);

// Custom configuration
const customClient = new TransVoucher({
  apiKey: apiKey,
  environment: 'sandbox',
  timeout: 60000, // 60 seconds
  baseUrl: 'https://custom-api.example.com' // Optional custom URL
});

module.exports = { client, customClient };
```

## Error Handling in JavaScript

```javascript
// error-handling.js
const TransVoucher = require('@transvoucher/sdk').default;
const { ValidationError, AuthenticationError, ApiError, NetworkError } = require('@transvoucher/sdk');

async function handleErrors() {
  const client = TransVoucher.sandbox('invalid-key');
  
  try {
    await client.payments.create({
      amount: 100,
      currency: 'USD'
    });
  } catch (error) {
    // Check error type
    if (error instanceof ValidationError) {
      console.log('Validation Error:', error.errors);
    } else if (error instanceof AuthenticationError) {
      console.log('Auth Error:', error.message);
    } else if (error instanceof ApiError) {
      console.log('API Error:', error.statusCode, error.message);
    } else if (error instanceof NetworkError) {
      console.log('Network Error:', error.message);
    } else {
      console.log('Unknown Error:', error.message);
    }
  }
}
```

## Package.json for JavaScript Project

```json
{
  "name": "my-transvoucher-app",
  "version": "1.0.0",
  "description": "JavaScript app using TransVoucher SDK",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "webhook": "node webhook-server.js"
  },
  "dependencies": {
    "@transvoucher/sdk": "^1.0.0",
    "express": "^4.18.0"
  },
  "engines": {
    "node": ">=16.0.0"
  }
}
```

## Key Points for JavaScript Usage

1. **No TypeScript Required**: You don't need TypeScript installed or configured
2. **Full Feature Support**: All SDK features work exactly the same
3. **CommonJS & ES Modules**: Use whichever module system you prefer
4. **Error Handling**: Import and use specific error classes for better error handling
5. **Autocomplete**: Many editors will still provide autocomplete using the included type definitions
6. **Node.js 16+**: Only requirement is Node.js 16 or higher

## Running the Examples

```bash
# Install the SDK
npm install @transvoucher/sdk

# Run CommonJS examples
node payment-example.js
node check-status.js
node list-payments.js

# Run ES Module examples
node payment-esm.mjs
node advanced-esm.mjs

# Run webhook server
node webhook-server.js
```

The SDK is designed to be JavaScript-first with TypeScript as an enhancement, so you get the full functionality without any TypeScript complexity! 