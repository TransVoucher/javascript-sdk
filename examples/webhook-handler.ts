/**
 * Example: Webhook Handler
 * 
 * This example demonstrates how to handle TransVoucher webhooks with signature verification
 * using the TransVoucher SDK in an Express.js application.
 */

import express from 'express';
import { WebhookUtils, WebhookEvent } from '../src/index';

// Your webhook secret from TransVoucher dashboard
const WEBHOOK_SECRET = process.env.TRANSVOUCHER_WEBHOOK_SECRET || 'your-webhook-secret-here';

const app = express();

// Middleware to capture raw body for signature verification
// This is crucial - we need the raw body to verify the signature
app.use('/webhook', express.raw({ type: 'application/json' }));

// Other routes can use JSON middleware
app.use(express.json());

/**
 * Webhook endpoint handler
 */
app.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-transvoucher-signature'] as string;
    const payload = req.body;

    console.log('📨 Webhook received');
    console.log('Signature:', signature);
    console.log('Payload size:', payload.length, 'bytes');

    // Verify and parse the webhook event
    const result = WebhookUtils.parseEvent(payload, signature, WEBHOOK_SECRET);

    if (!result.isValid || !result.event) {
      console.error('❌ Invalid webhook signature or payload');
      console.error('Error:', result.error);
      return res.status(400).json({ 
        error: 'Invalid webhook signature or payload',
        details: result.error
      });
    }

    const event = result.event;
    console.log('✅ Webhook verified successfully');
    console.log('Event Type:', event.event);
    console.log('Timestamp:', event.timestamp);

    // Handle the event based on its type
    await handleWebhookEvent(event);

    // Always respond with 200 to acknowledge receipt
    res.status(200).json({ 
      received: true,
      event_id: event.id,
      event_type: event.type
    });

  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    
    // Return 500 to indicate processing failure
    // TransVoucher will retry the webhook
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Handle different webhook event types
 */
async function handleWebhookEvent(event: WebhookEvent): Promise<void> {
  const transaction = event.data.transaction;
  
  console.log('\n🔄 Processing webhook event...');
  console.log('Transaction ID:', transaction.id);
  console.log('Reference ID:', transaction.reference_id);
  console.log('Amount:', transaction.amount, transaction.currency);
  console.log('Status:', transaction.status);
  console.log('Payment Method:', transaction.payment_method);
  
  if (event.data.customer_details) {
    console.log('Customer Name:', event.data.customer_details.full_name);
    if (event.data.customer_details.email) {
      console.log('Customer Email:', event.data.customer_details.email);
    }
  }

  switch (event.event) {
    case 'payment_intent.created':
      await handlePaymentIntentCreated(event);
      break;

    case 'payment_intent.processing':
      await handlePaymentIntentProcessing(event);
      break;
      
    case 'payment_intent.succeeded':
      await handlePaymentIntentSucceeded(event);
      break;
      
    case 'payment_intent.failed':
      await handlePaymentIntentFailed(event);
      break;
      
    case 'payment_intent.cancelled':
      await handlePaymentIntentCancelled(event);
      break;
      
    case 'payment_intent.expired':
      await handlePaymentIntentExpired(event);
      break;
      
    default:
      console.log('⚠️ Unhandled event type:', event.event);
  }
  
  console.log('✅ Event processed successfully\n');
}

/**
 * Handle payment intent created event
 */
async function handlePaymentIntentCreated(event: WebhookEvent): Promise<void> {
  console.log('🆕 Payment intent created');
  
  const transaction = event.data.transaction;
  
  // Example: Log the payment intent creation
  // await logPaymentIntent(transaction.id, transaction.reference_id);
  
  // Example: Initialize order status
  // await initializeOrder(transaction.reference_id, transaction.amount, transaction.currency);
  
  console.log('📝 Payment intent logged');
}

/**
 * Handle payment intent created event
 */
async function handlePaymentIntentProcessing(event: WebhookEvent): Promise<void> {
  console.log('🆕 Payment attempt was started. Processing...');
  
  const transaction = event.data.transaction;
  
  // Example: Log the payment intent creation
  // await logPaymentIntent(transaction.id, transaction.reference_id);
  
  // Example: Initialize order status
  // await initializeOrder(transaction.reference_id, transaction.amount, transaction.currency);
  
  console.log('📝 Payment intent logged');
}

/**
 * Handle payment intent succeeded event
 */
async function handlePaymentIntentSucceeded(event: WebhookEvent): Promise<void> {
  console.log('🎉 Payment intent succeeded!');
  
  const transaction = event.data.transaction;
  
  // Example: Fulfill the order
  // await fulfillOrder(transaction.reference_id);
  
  // Example: Send receipt email if customer details exist
  // if (event.data.customer_details) {
  //   await sendReceiptEmail(event.data.customer_details, transaction);
  // }
  
  // Example: Process metadata if exists
  // if (event.data.metadata) {
  //   await processMetadata(transaction.id, event.data.metadata);
  // }
  
  console.log('📦 Order fulfilled and receipt sent');
}

/**
 * Handle payment intent failed event
 */
async function handlePaymentIntentFailed(event: WebhookEvent): Promise<void> {
  console.log('❌ Payment intent failed');
  
  const transaction = event.data.transaction;
  
  // Example: Update order status
  // await updateOrderStatus(transaction.reference_id, 'failed');
  
  // Example: Send failure notification if customer details exist
  // if (event.data.customer_details) {
  //   await sendFailureNotification(event.data.customer_details, transaction);
  // }
  
  console.log('📧 Failure notification sent');
}

/**
 * Handle payment intent expired event
 */
async function handlePaymentIntentExpired(event: WebhookEvent): Promise<void> {
  console.log('⏰ Payment intent expired');
  
  const transaction = event.data.transaction;
  
  // Example: Clean up pending order
  // await cleanupExpiredOrder(transaction.reference_id);
  
  // Example: Release held inventory
  // await releaseInventory(transaction.reference_id);
  
  console.log('🧹 Expired order cleaned up');
}

/**
 * Handle payment intent cancelled event
 */
async function handlePaymentIntentCancelled(event: WebhookEvent): Promise<void> {
  console.log('🚫 Payment intent was cancelled');
  
  const transaction = event.data.transaction;
  
  // Example: Handle cancellation
  // await handleOrderCancellation(transaction.reference_id);
  
  // Example: Release held inventory
  // await releaseInventory(transaction.reference_id);
  
  console.log('📝 Cancellation processed');
}

/**
 * Alternative: Using the webhook handler utility
 */
const webhookHandler = WebhookUtils.createHandler(WEBHOOK_SECRET, {
  'payment_intent.created': async (event) => {
    console.log('Handler: Payment intent created:', event.data.transaction.id);
  },
  'payment_intent.processing': async (event) => {
    console.log('Handler: Payment intent processing:', event.data.transaction.id);
  },
  'payment_intent.succeeded': async (event) => {
    console.log('Handler: Payment intent succeeded:', event.data.transaction.id);
  },
  'payment_intent.failed': async (event) => {
    console.log('Handler: Payment intent failed:', event.data.transaction.id);
  },
  'payment_intent.cancelled': async (event) => {
    console.log('Handler: Payment intent cancelled:', event.data.transaction.id);
  },
  'payment_intent.expired': async (event) => {
    console.log('Handler: Payment intent expired:', event.data.transaction.id);
  }
});

// Alternative endpoint using the handler utility
app.post('/webhook-alt', async (req, res) => {
  try {
    const signature = req.headers['x-transvoucher-signature'] as string;
    await webhookHandler(req.body, signature);
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Handler error:', error);
    res.status(400).json({ error: 'Invalid webhook' });
  }
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'TransVoucher Webhook Handler',
    timestamp: new Date().toISOString()
  });
});

/**
 * Root endpoint
 */
app.get('/', (req, res) => {
  res.json({
    message: 'TransVoucher Webhook Handler',
    endpoints: {
      webhook: 'POST /webhook',
      webhook_alt: 'POST /webhook-alt',
      health: 'GET /health'
    }
  });
});

// Start the server
const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Webhook server running on port ${PORT}`);
    console.log(`📝 Webhook URL: http://localhost:${PORT}/webhook`);
    console.log(`🔐 Webhook secret: ${WEBHOOK_SECRET}`);
    console.log('\n💡 Don\'t forget to:');
    console.log('1. Set your webhook URL in the TransVoucher dashboard');
    console.log('2. Configure the webhook secret environment variable');
    console.log('3. Use a tool like ngrok for local testing\n');
  });
}

export { app, handleWebhookEvent }; 