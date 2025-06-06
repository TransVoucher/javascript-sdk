/**
 * Example: Create a Payment
 * 
 * This example demonstrates how to create a new payment using the TransVoucher SDK.
 */

import TransVoucher from '../src/index';

async function createPaymentExample() {
  try {
    // Initialize the client
    const client = TransVoucher.sandbox('your-api-key-here');
    
    // Create a payment
    const payment = await client.payments.create({
      amount: 100.00,
      currency: 'USD',
      reference: 'order-' + Date.now(),
      description: 'Example payment for testing',
      customer_email: 'customer@example.com',
      customer_name: 'John Doe',
      webhook_url: 'https://yoursite.com/webhook',
      redirect_url: 'https://yoursite.com/success',
      metadata: {
        order_id: '12345',
        user_id: '67890',
        source: 'website'
      }
    });

    console.log('✅ Payment created successfully!');
    console.log('Payment ID:', payment.id);
    console.log('Payment URL:', payment.payment_url);
    console.log('QR Code:', payment.qr_code);
    console.log('Status:', payment.status);
    console.log('Amount:', payment.amount, payment.currency);
    console.log('Reference:', payment.reference);
    console.log('Description:', payment.description);
    console.log('Customer:', payment.customer_name, '<' + payment.customer_email + '>');
    
    if (payment.expires_at) {
      console.log('Expires at:', payment.expires_at);
    }
    
    if (payment.metadata) {
      console.log('Metadata:', JSON.stringify(payment.metadata, null, 2));
    }

  } catch (error) {
    console.error('❌ Error creating payment:');
    
    if (error instanceof Error) {
      console.error('Message:', error.message);
      
      // Handle specific error types
      if ('errors' in error) {
        console.error('Validation errors:', (error as any).errors);
      }
      
      if ('statusCode' in error) {
        console.error('Status code:', (error as any).statusCode);
      }
    } else {
      console.error('Unknown error:', error);
    }
  }
}

// Run the example
if (require.main === module) {
  createPaymentExample();
}

export { createPaymentExample }; 