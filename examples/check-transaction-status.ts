/**
 * Example: Check Transaction Status
 * 
 * This example demonstrates how to check the status of a transaction using the TransVoucher SDK.
 */

import TransVoucher from '../src/index';

async function checkTransactionStatusExample() {
  try {
    // Initialize the client
    const client = TransVoucher.sandbox('your-api-key-here', 'your-api-secret-here');
    
    // Replace with actual transaction ID
    const transactionId = 'transaction-uuid-here';
    
    // Get transaction status
    const transaction = await client.payments.getTransactionStatus(transactionId);

    console.log('✅ Transaction status retrieved successfully!');
    console.log('Transaction ID:', transaction.id);
    console.log('Status:', transaction.status);
    console.log('Amount:', transaction.fiat_total_amount, transaction.fiat_currency);
    console.log('Created at:', transaction.created_at);
    console.log('Updated at:', transaction.updated_at);
    
    if (transaction.reference_id) {
      console.log('Reference:', transaction.reference_id);
    }
    
    if (transaction.description) {
      console.log('Description:', transaction.description);
    }

    if (transaction.payment_url) {
      console.log('Payment URL:', transaction.payment_url);
    }
    
    if (transaction.expires_at) {
      const expiresAt = new Date(transaction.expires_at);
      const now = new Date();
      const isExpired = expiresAt < now;
      
      console.log('Expires at:', transaction.expires_at);
      console.log('Is expired:', isExpired);
      
      if (!isExpired) {
        const timeUntilExpiry = expiresAt.getTime() - now.getTime();
        const minutesUntilExpiry = Math.floor(timeUntilExpiry / (1000 * 60));
        console.log('Minutes until expiry:', minutesUntilExpiry);
      }
    }
    
    if (transaction.metadata) {
      console.log('Metadata:', JSON.stringify(transaction.metadata, null, 2));
    }

    // Status-specific actions
    switch (transaction.status) {
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
        console.log('❓ Unknown transaction status:', transaction.status);
    }

  } catch (error) {
    console.error('❌ Error checking transaction status:');
    
    if (error instanceof Error) {
      console.error('Message:', error.message);
      
      if ('statusCode' in error) {
        const statusCode = (error as any).statusCode;
        console.error('Status code:', statusCode);
        
        if (statusCode === 404) {
          console.error('Payment not found - please check the transaction ID');
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
  checkTransactionStatusExample();
}

export { checkTransactionStatusExample }; 