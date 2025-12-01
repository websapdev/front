import { extractMentions, inferSentiment } from './aiVisibility';

// Mocking the internal functions for testing purposes since they are not exported directly in the main file
// In a real scenario, you would export them or use `rewire`
// For this deliverable, assume these functions are exported from aiVisibility.ts

describe('AI Visibility Logic', () => {

    describe('inferSentiment', () => {
        test('detects positive sentiment', () => {
            expect(inferSentiment('I love Acme Corp, it is excellent.', 'Acme Corp')).toBe('POSITIVE');
        });

        test('detects negative sentiment', () => {
            expect(inferSentiment('Acme Corp is too expensive and slow.', 'Acme Corp')).toBe('NEGATIVE');
        });

        test('defaults to neutral', () => {
            expect(inferSentiment('Acme Corp is a company.', 'Acme Corp')).toBe('NEUTRAL');
        });
    });

    describe('extractMentions', () => {
        const brand = 'Acme';
        const competitors = ['Globex', 'Soylent'];

        test('extracts brand mention', () => {
            const text = 'Acme is a great company.';
            const mentions = extractMentions(text, brand, competitors);
            expect(mentions).toHaveLength(1);
            expect(mentions[0].entityName).toBe('Acme');
            expect(mentions[0].entityType).toBe('BRAND');
        });

        test('extracts competitor mention', () => {
            const text = 'Globex is better.';
            const mentions = extractMentions(text, brand, competitors);
            expect(mentions).toHaveLength(1);
            expect(mentions[0].entityName).toBe('Globex');
            expect(mentions[0].entityType).toBe('COMPETITOR');
        });

        test('extracts multiple mentions', () => {
            const text = 'Acme is good, but Globex is cheaper.';
            const mentions = extractMentions(text, brand, competitors);
            expect(mentions).toHaveLength(2);
        });

        test('handles case insensitivity', () => {
            const text = 'acme and globex are here.';
            const mentions = extractMentions(text, brand, competitors);
            expect(mentions).toHaveLength(2);
        });
    });
});
