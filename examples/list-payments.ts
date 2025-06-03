/**
 * Example: List Payments
 * 
 * This example demonstrates how to list payments with various filters and pagination
 * using the TransVoucher SDK.
 */

import TransVoucher from '../src/index';

async function listPaymentsExample() {
  try {
    // Initialize the client
    const client = TransVoucher.sandbox('your-api-key-here');
    
    console.log('📋 Listing payments...\n');

    // Example 1: List all payments (first page)
    console.log('=== Example 1: List all payments (first page) ===');
    const allPayments = await client.payments.list({
      page: 1,
      per_page: 5
    });
    
    console.log(`Found ${allPayments.meta.total} total payments`);
    console.log(`Showing page ${allPayments.meta.current_page} of ${allPayments.meta.last_page}`);
    console.log(`Payments on this page: ${allPayments.payments.length}\n`);
    
    allPayments.payments.forEach((payment, index) => {
      console.log(`${index + 1}. ${payment.id} - ${payment.status} - ${payment.amount} ${payment.currency}`);
      if (payment.reference) {
        console.log(`   Reference: ${payment.reference}`);
      }
      if (payment.description) {
        console.log(`   Description: ${payment.description}`);
      }
      console.log(`   Created: ${payment.created_at}\n`);
    });

    // Example 2: Filter by status
    console.log('\n=== Example 2: Filter by completed payments ===');
    const completedPayments = await client.payments.list({
      status: 'completed',
      per_page: 3
    });
    
    console.log(`Found ${completedPayments.meta.total} completed payments`);
    completedPayments.payments.forEach((payment, index) => {
      console.log(`${index + 1}. ${payment.id} - ${payment.amount} ${payment.currency} - ${payment.status}`);
    });

    // Example 3: Filter by date range
    console.log('\n=== Example 3: Filter by date range (last 30 days) ===');
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const today = new Date();
    
    const recentPayments = await client.payments.list({
      from_date: thirtyDaysAgo.toISOString().split('T')[0], // YYYY-MM-DD format
      to_date: today.toISOString().split('T')[0],
      per_page: 5
    });
    
    console.log(`Found ${recentPayments.meta.total} payments in the last 30 days`);
    recentPayments.payments.forEach((payment, index) => {
      console.log(`${index + 1}. ${payment.id} - ${payment.status} - ${payment.created_at}`);
    });

    // Example 4: Filter by currency
    console.log('\n=== Example 4: Filter by currency (USD) ===');
    const usdPayments = await client.payments.list({
      currency: 'USD',
      per_page: 5
    });
    
    console.log(`Found ${usdPayments.meta.total} USD payments`);
    usdPayments.payments.forEach((payment, index) => {
      console.log(`${index + 1}. ${payment.id} - $${payment.amount} - ${payment.status}`);
    });

    // Example 5: Search by customer email
    console.log('\n=== Example 5: Search by customer email ===');
    const customerPayments = await client.payments.list({
      customer_email: 'customer@example.com',
      per_page: 3
    });
    
    console.log(`Found ${customerPayments.meta.total} payments for customer@example.com`);
    customerPayments.payments.forEach((payment, index) => {
      console.log(`${index + 1}. ${payment.id} - ${payment.amount} ${payment.currency} - ${payment.status}`);
      if (payment.customer_name) {
        console.log(`   Customer: ${payment.customer_name}`);
      }
    });

    // Example 6: Pagination example
    console.log('\n=== Example 6: Pagination example ===');
    let currentPage = 1;
    const maxPages = 3; // Limit for demo purposes
    
    while (currentPage <= maxPages) {
      const pagePayments = await client.payments.list({
        page: currentPage,
        per_page: 2
      });
      
      console.log(`\n--- Page ${currentPage} of ${pagePayments.meta.last_page} ---`);
      console.log(`Showing ${pagePayments.meta.from} to ${pagePayments.meta.to} of ${pagePayments.meta.total} payments`);
      
      pagePayments.payments.forEach((payment, index) => {
        console.log(`${index + 1}. ${payment.id} - ${payment.status}`);
      });
      
      currentPage++;
      
      // Break if we've reached the last page
      if (currentPage > pagePayments.meta.last_page) {
        break;
      }
    }

    // Example 7: Complex filtering
    console.log('\n=== Example 7: Complex filtering ===');
    const complexFilter = await client.payments.list({
      status: 'completed',
      currency: 'USD',
      from_date: thirtyDaysAgo.toISOString().split('T')[0],
      page: 1,
      per_page: 10
    });
    
    console.log(`Complex filter results: ${complexFilter.meta.total} completed USD payments in the last 30 days`);

  } catch (error) {
    console.error('❌ Error listing payments:');
    
    if (error instanceof Error) {
      console.error('Message:', error.message);
      
      if ('errors' in error) {
        console.error('Validation errors:', (error as any).errors);
      }
      
      if ('statusCode' in error) {
        const statusCode = (error as any).statusCode;
        console.error('Status code:', statusCode);
        
        if (statusCode === 401) {
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
  listPaymentsExample();
}

export { listPaymentsExample }; 