/**
 * Example: Check Payment Link Status
 * 
 * This example demonstrates how to check the status of a payment link using the TransVoucher SDK.
 */

import TransVoucher from '../src/index';

async function checkPaymentLinkStatusExample() {
  try {
    // Initialize the client
    const client = TransVoucher.sandbox('your-api-key-here', 'your-api-secret-here');
    
    // Replace with actual payment link ID
    const paymentLinkId = 'payment-link-uuid-here';
    
    // Get payment status
    const payment = await client.payments.getPaymentLinkStatus(paymentLinkId);

    console.log('✅ Payment link status retrieved successfully!');
    console.log('Transaction ID:', payment.id);
    console.log('Status:', payment.status);
    console.log('Amount:', payment.fiat_total_amount, payment.fiat_currency);
    console.log('Created at:', payment.created_at);
    console.log('Updated at:', payment.updated_at);
    
    if (payment.reference_id) {
      console.log('Reference:', payment.reference_id);
    }
    
    if (payment.description) {
      console.log('Description:', payment.description);
    }

    if (payment.payment_url) {
      console.log('Payment URL:', payment.payment_url);
    }
    
    if (payment.expires_at) {
      const expiresAt = new Date(payment.expires_at);
      const now = new Date();
      const isExpired = expiresAt < now;
      
      console.log('Expires at:', payment.expires_at);
      console.log('Is expired:', isExpired);
      
      if (!isExpired) {
        const timeUntilExpiry = expiresAt.getTime() - now.getTime();
        const minutesUntilExpiry = Math.floor(timeUntilExpiry / (1000 * 60));
        console.log('Minutes until expiry:', minutesUntilExpiry);
      }
    }
    
    if (payment.metadata) {
      console.log('Metadata:', JSON.stringify(payment.metadata, null, 2));
    }

    // Status-specific actions
    switch (payment.status) {
      case 'pending':
        console.log('🟡 Payment is pending - waiting for customer action');
        break;
      case 'attempting':
        console.log('🔵 Payment is being attempted');
        break;
      case 'processing':
        console.log('🔵 Payment is being processed');
        break;
      case 'completed':
        console.log('🟢 Payment completed successfully!');
        break;
      case 'failed':
        console.log('🔴 Payment failed');
        break;
      case 'expired':
        console.log('🟠 Payment has expired');
        break;
      case 'cancelled':
        console.log('⚪ Payment was cancelled');
        break;
      default:
        console.log('❓ Unknown payment status:', payment.status);
    }

  } catch (error) {
    console.error('❌ Error checking payment status:');
    
    if (error instanceof Error) {
      console.error('Message:', error.message);
      
      if ('statusCode' in error) {
        const statusCode = (error as any).statusCode;
        console.error('Status code:', statusCode);
        
        if (statusCode === 404) {
          console.error('Payment not found - please check the payment ID');
        } else if (statusCode === 401) {
          console.error('Authentication failed - please check your API key');
        }
      }
    } else {
      console.error('Unknown error:', error);
    }
  }
}

// Run the example
if (require.main === module) {
  checkPaymentLinkStatusExample();
}

export { checkPaymentLinkStatusExample }; 