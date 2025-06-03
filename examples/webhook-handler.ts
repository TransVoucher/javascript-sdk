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
    console.log('Event ID:', event.id);
    console.log('Event Type:', event.type);
    console.log('Created At:', event.created_at);

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
  const payment = event.data;
  
  console.log('\n🔄 Processing webhook event...');
  console.log('Payment ID:', payment.id);
  console.log('Amount:', payment.amount, payment.currency);
  console.log('Status:', payment.status);
  
  if (payment.reference) {
    console.log('Reference:', payment.reference);
  }
  
  if (payment.customer_email) {
    console.log('Customer:', payment.customer_email);
  }

  switch (event.type) {
    case 'payment.created':
      await handlePaymentCreated(event);
      break;
      
    case 'payment.processing':
      await handlePaymentProcessing(event);
      break;
      
    case 'payment.completed':
      await handlePaymentCompleted(event);
      break;
      
    case 'payment.failed':
      await handlePaymentFailed(event);
      break;
      
    case 'payment.expired':
      await handlePaymentExpired(event);
      break;
      
    case 'payment.cancelled':
      await handlePaymentCancelled(event);
      break;
      
    default:
      console.log('⚠️ Unhandled event type:', event.type);
  }
  
  console.log('✅ Event processed successfully\n');
}

/**
 * Handle payment created event
 */
async function handlePaymentCreated(event: WebhookEvent): Promise<void> {
  console.log('🆕 Payment created - sending confirmation email...');
  
  // Example: Send confirmation email to customer
  // await sendConfirmationEmail(event.data.customer_email, event.data);
  
  // Example: Log to database
  // await logPaymentEvent(event.data.id, 'created', event.data);
  
  console.log('📧 Confirmation email sent');
}

/**
 * Handle payment processing event
 */
async function handlePaymentProcessing(event: WebhookEvent): Promise<void> {
  console.log('⏳ Payment is being processed...');
  
  // Example: Update order status
  // if (event.data.reference) {
  //   await updateOrderStatus(event.data.reference, 'processing');
  // }
  
  console.log('📊 Order status updated to processing');
}

/**
 * Handle payment completed event
 */
async function handlePaymentCompleted(event: WebhookEvent): Promise<void> {
  console.log('🎉 Payment completed successfully!');
  
  // Example: Fulfill the order
  // if (event.data.reference) {
  //   await fulfillOrder(event.data.reference);
  // }
  
  // Example: Send receipt email
  // await sendReceiptEmail(event.data.customer_email, event.data);
  
  // Example: Update customer account
  // if (event.data.metadata?.user_id) {
  //   await updateCustomerAccount(event.data.metadata.user_id, event.data.amount);
  // }
  
  console.log('📦 Order fulfilled and receipt sent');
}

/**
 * Handle payment failed event
 */
async function handlePaymentFailed(event: WebhookEvent): Promise<void> {
  console.log('❌ Payment failed');
  
  // Example: Send failure notification
  // await sendPaymentFailureEmail(event.data.customer_email, event.data);
  
  // Example: Update order status
  // if (event.data.reference) {
  //   await updateOrderStatus(event.data.reference, 'payment_failed');
  // }
  
  console.log('📧 Failure notification sent');
}

/**
 * Handle payment expired event
 */
async function handlePaymentExpired(event: WebhookEvent): Promise<void> {
  console.log('⏰ Payment expired');
  
  // Example: Clean up pending order
  // if (event.data.reference) {
  //   await cleanupExpiredOrder(event.data.reference);
  // }
  
  console.log('🧹 Expired order cleaned up');
}

/**
 * Handle payment cancelled event
 */
async function handlePaymentCancelled(event: WebhookEvent): Promise<void> {
  console.log('🚫 Payment was cancelled');
  
  // Example: Handle cancellation
  // if (event.data.reference) {
  //   await handleOrderCancellation(event.data.reference);
  // }
  
  console.log('📝 Cancellation processed');
}

/**
 * Alternative: Using the webhook handler utility
 */
const webhookHandler = WebhookUtils.createHandler(WEBHOOK_SECRET, {
  'payment.created': async (event) => {
    console.log('Handler: Payment created:', event.data.id);
  },
  'payment.completed': async (event) => {
    console.log('Handler: Payment completed:', event.data.id);
  },
  'payment.failed': async (event) => {
    console.log('Handler: Payment failed:', event.data.id);
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