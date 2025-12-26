import { WebhookUtils } from '../utils/webhook';
import { WebhookEvent, PaymentWebhookEvent, HealthCheckWebhookEvent } from '../types';
import * as crypto from 'crypto';

describe('WebhookUtils', () => {
    const secret = 'test-secret';

    describe('verifySignature', () => {
        it('should return true for valid signature', () => {
            const payload = JSON.stringify({ event: 'test' });
            const signature = `sha256=${crypto.createHmac('sha256', secret).update(payload).digest('hex')}`;
            expect(WebhookUtils.verifySignature(payload, signature, secret)).toBe(true);
        });

        it('should return false for invalid signature', () => {
            const payload = JSON.stringify({ event: 'test' });
            const signature = 'sha256=invalid';
            expect(WebhookUtils.verifySignature(payload, signature, secret)).toBe(false);
        });
    });

    describe('parseEvent', () => {
        it('should parse system.health_check event', () => {
            const eventData = {
                event: 'system.health_check',
                timestamp: new Date().toISOString(),
                data: {
                    message: 'Health check',
                    sales_channel_id: 123
                }
            };
            const payload = JSON.stringify(eventData);
            const signature = `sha256=${crypto.createHmac('sha256', secret).update(payload).digest('hex')}`;

            const result = WebhookUtils.parseEvent(payload, signature, secret);

            expect(result.isValid).toBe(true);
            expect(result.event).toBeDefined();
            if (result.event?.event === 'system.health_check') {
                expect(result.event.data.message).toBe('Health check');
                expect(result.event.data.sales_channel_id).toBe(123);
            } else {
                fail('Event type should be system.health_check');
            }
        });

        it('should parse payment_intent.created event', () => {
            const eventData = {
                event: 'payment_intent.created',
                timestamp: new Date().toISOString(),
                data: {
                    transaction: {
                        id: 'tx_123',
                        reference_id: 'ref_123',
                        fiat_base_amount: 100,
                        fiat_total_amount: 100,
                        fiat_currency: 'USD',
                        commodity_amount: 0.1,
                        commodity: 'BTC',
                        network: 'BTC',
                        status: 'pending',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    },
                    sales_channel: { id: 'sc_1', name: 'Channel 1', type: 'web' },
                    merchant: { id: 'm_1', company_name: 'Merchant 1' }
                }
            };
            const payload = JSON.stringify(eventData);
            const signature = `sha256=${crypto.createHmac('sha256', secret).update(payload).digest('hex')}`;

            const result = WebhookUtils.parseEvent(payload, signature, secret);

            expect(result.isValid).toBe(true);
            if (result.event?.event === 'payment_intent.created') {
                expect(result.event.data.transaction.id).toBe('tx_123');
            } else {
                fail('Event type should be payment_intent.created');
            }
        });

        it('should fail validation for invalid health check data', () => {
            const eventData = {
                event: 'system.health_check',
                timestamp: new Date().toISOString(),
                data: {
                    message: 'Health check'
                    // Missing sales_channel_id
                }
            };
            const payload = JSON.stringify(eventData);
            const signature = `sha256=${crypto.createHmac('sha256', secret).update(payload).digest('hex')}`;

            const result = WebhookUtils.parseEvent(payload, signature, secret);

            expect(result.isValid).toBe(false);
            expect(result.error).toContain('sales_channel_id');
        });
    });
});
