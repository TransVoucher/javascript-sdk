/**
 * Example: Loading Networks, Commodities, Currencies and Using Conversion Rates
 *
 * This example demonstrates how to:
 * 1. Load all available networks, commodities, and currencies
 * 2. Use their short_codes with the conversion rate endpoint
 * 3. Create a payment with the selected options
 */

import TransVoucher from '../src/index';
import { Network, Commodity, Currency } from '../src/types';

async function conversionRatesExample() {
  try {
    // Initialize the SDK
    const transvoucher = TransVoucher.sandbox(
      process.env.TRANSVOUCHER_API_KEY || 'your-api-key',
      process.env.TRANSVOUCHER_API_SECRET || 'your-api-secret'
    );

    console.log('=== TransVoucher Conversion Rate Example ===\n');

    // Step 1: Load all available options
    console.log('Step 1: Loading available networks, commodities, and currencies...');

    const networks = await transvoucher.networks.all();
    const commodities = await transvoucher.commodities.all();
    const currencies = await transvoucher.currencies.all();

    console.log(`✓ Loaded ${networks.length} networks`);
    console.log(`✓ Loaded ${commodities.length} commodities`);
    console.log(`✓ Loaded ${currencies.length} currencies\n`);

    // Step 2: Display available networks
    console.log('Step 2: Available Networks (use short_code for conversion rate endpoint)');
    console.log('-'.repeat(80));

    networks.forEach(network => {
      const testnetLabel = transvoucher.networks.isTestnet(network) ? '[TESTNET]' : '';
      console.log(
        `  • ${network.name} (short_code: ${network.short_code}) - Chain ID: ${network.chain_id || 'N/A'} ${testnetLabel}`
      );
    });
    console.log();

    // Step 3: Display available commodities
    console.log('Step 3: Available Commodities (use short_code for conversion rate endpoint)');
    console.log('-'.repeat(80));

    commodities.forEach(commodity => {
      const contract = commodity.contract_address
        ? `${commodity.contract_address.substring(0, 10)}...`
        : 'Native Token';

      console.log(
        `  • ${commodity.name} (short_code: ${commodity.short_code}) on ${commodity.network_short_code} - USD Value: ${commodity.current_usd_value} - Contract: ${contract}`
      );
    });
    console.log();

    // Step 4: Display available currencies
    console.log('Step 4: Available Currencies (use short_code for conversion rate endpoint)');
    console.log('-'.repeat(80));

    currencies.forEach(currency => {
      console.log(
        `  • ${currency.name} (short_code: ${currency.short_code}) - Symbol: ${currency.symbol} - USD Value: ${currency.current_usd_value}`
      );
    });
    console.log();

    // Step 5: Find a specific commodity and network combination
    console.log('Step 5: Finding USDT on Polygon network...');

    // Find USDT on Polygon network using getByNetwork
    const polygonCommodities = await transvoucher.commodities.getByNetwork('POL');
    const usdtOnPolygon = polygonCommodities.find(c => c.short_code === 'USDT');

    if (!usdtOnPolygon) {
      console.log('✗ USDT on Polygon not available');
      process.exit(1);
    }

    const polygonNetwork = await transvoucher.networks.findByCode(usdtOnPolygon.network_short_code);

    if (!polygonNetwork) {
      console.log('✗ Polygon network not found');
      process.exit(1);
    }

    console.log('✓ Found configuration:');
    console.log(`  Network: ${polygonNetwork.name} (short_code: ${polygonNetwork.short_code})`);
    console.log(`  Commodity: ${usdtOnPolygon.name} (short_code: ${usdtOnPolygon.short_code})`);
    console.log(`  Contract: ${usdtOnPolygon.contract_address}`);
    console.log(`  Chain ID: ${polygonNetwork.chain_id}\n`);

    // Step 6: Get conversion rates for multiple currencies
    console.log('Step 6: Getting conversion rates using short codes...');
    console.log('-'.repeat(80));

    const fiatCurrencies = ['USD', 'EUR', 'GBP'];

    for (const currencyCode of fiatCurrencies) {
      try {
        // The conversion rate endpoint requires SHORT CODES for all parameters:
        // - network: network short_code (e.g., 'POL', 'ETH', 'BSC')
        // - commodity: commodity short_code (e.g., 'USDT', 'USDC', 'MATIC')
        // - fiatCurrency: currency short_code (e.g., 'USD', 'EUR', 'GBP')
        // - paymentMethod: payment method (e.g., 'card', 'bank_transfer')

        const rate = await transvoucher.payments.getConversionRate(
          polygonNetwork.short_code,  // Network short_code: 'POL'
          usdtOnPolygon.short_code,   // Commodity short_code: 'USDT'
          currencyCode,                // Currency short_code: 'USD', 'EUR', 'GBP'
          'card'                       // Payment method
        );

        console.log(`✓ Conversion Rate for ${currencyCode}:`);
        console.log(`  Network: ${polygonNetwork.short_code}`);
        console.log(`  Commodity: ${usdtOnPolygon.short_code}`);
        console.log(`  Fiat Currency: ${currencyCode}`);
        console.log(`  Rate: ${rate.rate}\n`);
      } catch (error) {
        console.log(`✗ Error getting rate for ${currencyCode}: ${error instanceof Error ? error.message : error}\n`);
      }
    }

    // Step 7: Optional - Create a payment
    console.log('Step 7: Creating a test payment...');

    try {
      const payment = await transvoucher.payments.create({
        amount: 100.00,
        currency: 'USD',  // Use currency short_code
        title: 'Example Payment',
        description: 'Testing conversion rates with USDT on Polygon',
        success_url: 'https://example.com/success',
        cancel_url: 'https://example.com/cancel',
        metadata: {
          network: polygonNetwork.short_code,
          commodity: usdtOnPolygon.short_code,
        },
      });

      console.log('✓ Payment created successfully!');
      console.log(`  Payment ID: ${payment.id}`);
      console.log(`  Payment URL: ${payment.payment_url}`);
      console.log(`  Status: ${payment.status}\n`);
    } catch (error) {
      console.log(`✗ Error creating payment: ${error instanceof Error ? error.message : error}\n`);
    }

    // Step 8: Show commodities grouped by network
    console.log('Step 8: Commodities grouped by network');
    console.log('-'.repeat(80));

    const commoditiesByNetwork = new Map<string, Commodity[]>();

    commodities.forEach(commodity => {
      const networkCode = commodity.network_short_code;
      if (!commoditiesByNetwork.has(networkCode)) {
        commoditiesByNetwork.set(networkCode, []);
      }
      commoditiesByNetwork.get(networkCode)!.push(commodity);
    });

    for (const [networkCode, networkCommodities] of commoditiesByNetwork.entries()) {
      // Find network name
      const network = networks.find(n => n.short_code === networkCode);
      const networkName = network ? network.name : networkCode;

      console.log(`Network: ${networkName} (${networkCode})`);
      networkCommodities.forEach(commodity => {
        console.log(`  • ${commodity.name} (${commodity.short_code})`);
      });
      console.log();
    }

    // Step 9: Additional helper methods
    console.log('Step 9: Using helper methods');
    console.log('-'.repeat(80));

    // Check mainnet vs testnet
    const mainnets = await transvoucher.networks.getMainnets();
    const testnets = await transvoucher.networks.getTestnets();
    console.log(`Mainnet networks: ${mainnets.length}`);
    console.log(`Testnet networks: ${testnets.length}\n`);

    // Check native tokens vs contract tokens
    const nativeTokens = await transvoucher.commodities.getNativeTokens();
    const contractTokens = await transvoucher.commodities.getContractTokens();
    console.log(`Native tokens: ${nativeTokens.length}`);
    console.log(`Contract tokens: ${contractTokens.length}\n`);

    // Get commodities for a specific network
    const polCommodities = await transvoucher.commodities.getByNetwork('POL');
    console.log(`Commodities on Polygon: ${polCommodities.length}`);
    polCommodities.forEach(c => {
      const isNative = transvoucher.commodities.isNativeToken(c) ? '(Native)' : '(Contract)';
      console.log(`  • ${c.name} ${isNative}`);
    });

    console.log('\n=== Example Complete ===');

  } catch (error) {
    console.error('❌ Error in conversion rates example:');

    if (error instanceof Error) {
      console.error('Message:', error.message);

      if ('errors' in error) {
        console.error('Validation errors:', (error as any).errors);
      }

      if ('statusCode' in error) {
        const statusCode = (error as any).statusCode;
        console.error('Status code:', statusCode);

        if (statusCode === 401) {
          console.error('Authentication failed - please check your API credentials');
        } else if (statusCode === 404) {
          console.error('Endpoint not found - check your API version');
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
  conversionRatesExample();
}

export { conversionRatesExample };
