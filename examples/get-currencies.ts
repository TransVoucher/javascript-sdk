/**
 * Example: Get Available Currencies
 *
 * This example demonstrates how to retrieve and work with available currencies
 * using the TransVoucher SDK.
 */

import TransVoucher from '../src/index';
import { Currency } from '../src/types';

async function getCurrenciesExample() {
  try {
    // Initialize the client
    const client = TransVoucher.sandbox('your-api-key-here', 'your-api-secret-here');

    console.log('💱 TransVoucher - Get Available Currencies Example\n');
    console.log('='.repeat(80) + '\n');

    // Example 1: Get all available currencies
    console.log('=== Example 1: Get all available currencies ===\n');
    const currencies = await client.currencies.all();

    console.log(`Found ${currencies.length} available currencies:\n`);

    currencies.forEach((currency, index) => {
      console.log(`${index + 1}. ${currency.short_code} - ${currency.name}`);
      console.log(`   Symbol: ${currency.symbol}`);
      console.log(`   USD Value: ${currency.current_usd_value}`);

      if (client.currencies.isProcessedViaAnotherCurrency(currency)) {
        console.log(`   Processed via: ${currency.processed_via_currency_code}`);
      } else {
        console.log(`   Processing: Direct`);
      }
      console.log();
    });

    // Example 2: Find a specific currency by code
    console.log('\n=== Example 2: Find specific currency (USD) ===\n');
    const usd = await client.currencies.findByCode('USD');

    if (usd) {
      console.log('✓ Found USD:');
      console.log(`  Name: ${usd.name}`);
      console.log(`  Symbol: ${usd.symbol}`);
      console.log(`  USD Value: ${usd.current_usd_value}`);
      console.log(`  Processed via: ${usd.processed_via_currency_code || 'Direct'}`);
    } else {
      console.log('✗ USD not found');
    }

    // Example 3: Find currency (case-insensitive)
    console.log('\n=== Example 3: Find currency (case-insensitive) ===\n');
    const eur = await client.currencies.findByCode('eur'); // lowercase

    if (eur) {
      console.log('✓ Found EUR (searched with lowercase):');
      console.log(`  Name: ${eur.name}`);
      console.log(`  Symbol: ${eur.symbol}`);
    }

    // Example 4: Check if currency is supported
    console.log('\n=== Example 4: Check if currencies are supported ===\n');

    const currenciesToCheck = ['USD', 'EUR', 'GBP', 'XYZ'];

    for (const code of currenciesToCheck) {
      const isSupported = await client.currencies.isSupported(code);
      const status = isSupported ? '✓ Supported' : '✗ Not supported';
      console.log(`${code}: ${status}`);
    }

    // Example 5: Filter currencies by processing method
    console.log('\n=== Example 5: Filter by processing method ===\n');

    const directCurrencies = currencies.filter(c =>
      !client.currencies.isProcessedViaAnotherCurrency(c)
    );

    const indirectCurrencies = currencies.filter(c =>
      client.currencies.isProcessedViaAnotherCurrency(c)
    );

    console.log(`Direct processing (${directCurrencies.length}):`);
    directCurrencies.forEach(c => {
      console.log(`  - ${c.short_code}: ${c.name}`);
    });

    console.log(`\nProcessed via another currency (${indirectCurrencies.length}):`);
    indirectCurrencies.forEach(c => {
      console.log(`  - ${c.short_code}: ${c.name} (via ${c.processed_via_currency_code})`);
    });

    // Example 6: Build currency dropdown options
    console.log('\n=== Example 6: Generate HTML select options ===\n');

    console.log('<select name="currency">');
    currencies.forEach(currency => {
      const value = currency.short_code;
      const label = `${currency.name} (${currency.symbol})`;
      console.log(`  <option value="${value}">${label}</option>`);
    });
    console.log('</select>');

    // Example 7: Group currencies by USD value range
    console.log('\n=== Example 7: Group by USD value ===\n');

    const strongCurrencies = currencies.filter(c =>
      parseFloat(c.current_usd_value) >= 1.0
    );
    const weakCurrencies = currencies.filter(c =>
      parseFloat(c.current_usd_value) < 1.0
    );

    console.log(`Strong currencies (≥ 1 USD): ${strongCurrencies.length}`);
    strongCurrencies.forEach(c => {
      console.log(`  ${c.short_code}: ${c.current_usd_value} USD`);
    });

    console.log(`\nWeak currencies (< 1 USD): ${weakCurrencies.length}`);
    weakCurrencies.forEach(c => {
      console.log(`  ${c.short_code}: ${c.current_usd_value} USD`);
    });

    // Example 8: Create a currency info object
    console.log('\n=== Example 8: Create currency lookup map ===\n');

    const currencyMap = new Map<string, Currency>();
    currencies.forEach(currency => {
      currencyMap.set(currency.short_code, currency);
    });

    console.log('Currency lookup map created with codes:',
      Array.from(currencyMap.keys()).join(', ')
    );

    // Quick lookup example
    const gbp = currencyMap.get('GBP');
    if (gbp) {
      console.log(`\nQuick lookup for GBP: ${gbp.name} (${gbp.symbol})`);
    }

    // Example 9: Format currencies for display
    console.log('\n=== Example 9: Formatted currency list ===\n');

    console.log('Code | Name                  | Symbol | USD Value    | Processing');
    console.log('-'.repeat(80));

    currencies.forEach(currency => {
      const code = currency.short_code.padEnd(4);
      const name = currency.name.padEnd(21);
      const symbol = currency.symbol.padEnd(6);
      const value = currency.current_usd_value.padEnd(12);
      const processing = currency.processed_via_currency_code
        ? `via ${currency.processed_via_currency_code}`
        : 'Direct';

      console.log(`${code} | ${name} | ${symbol} | ${value} | ${processing}`);
    });

    console.log('\n✅ Currency retrieval examples completed successfully!');

  } catch (error) {
    console.error('❌ Error retrieving currencies:');

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
        } else if (statusCode === 404) {
          console.error('Currencies endpoint not found - check your API version');
        }
      }
    } else {
      console.error('Unknown error:', error);
    }

    process.exit(1);
  }
}

// Run the example
if (require.main === module) {
  getCurrenciesExample();
}

export { getCurrenciesExample };
