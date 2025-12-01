// Test file for Answer Hub functionality
// Run with: npx ts-node tests/answerHub/generator.test.ts

import { generateAnswerContent, slugifyQuestion } from '../../lib/answerHub/generator';

describe('Answer Hub Generator', () => {
    describe('slugifyQuestion', () => {
        test('converts question to URL-safe slug', () => {
            const question = 'What are the best running shoes for flat feet?';
            const slug = slugifyQuestion(question);
            expect(slug).toBe('what-are-the-best-running-shoes-for-flat-feet');
        });

        test('handles special characters', () => {
            const question = 'Is Brand X (really) the #1 choice?!';
            const slug = slugifyQuestion(question);
            expect(slug).toBe('is-brand-x-really-the-1-choice');
        });

        test('limits length to 100 characters', () => {
            const longQuestion = 'a'.repeat(150);
            const slug = slugifyQuestion(longQuestion);
            expect(slug.length).toBeLessThanOrEqual(100);
        });
    });

    describe('generateAnswerContent', () => {
        test('generates complete answer content', async () => {
            const content = await generateAnswerContent({
                brandName: 'Acme Corp',
                brandDomain: 'acme.com',
                question: 'What makes Acme Corp different?',
                intent: 'COMMERCIAL'
            });

            // Check title
            expect(content.title).toContain('Acme Corp');
            expect(content.title.length).toBeGreaterThan(0);

            // Check headline snippet
            expect(content.headlineSnippet).toContain('Acme Corp');
            expect(content.headlineSnippet.length).toBeGreaterThan(0);

            // Check sections
            expect(content.sections.length).toBeGreaterThan(0);
            expect(content.sections[0]).toHaveProperty('type');
            expect(content.sections[0]).toHaveProperty('heading');
            expect(content.sections[0]).toHaveProperty('body');

            // Check FAQ items
            expect(content.faqItems.length).toBeGreaterThan(0);
            expect(content.faqItems[0]).toHaveProperty('question');
            expect(content.faqItems[0]).toHaveProperty('answer');

            // Check schema blocks
            expect(content.schemaBlocks.length).toBeGreaterThan(0);
            const faqSchema = content.schemaBlocks.find(b => b.schemaType === 'FAQPage');
            expect(faqSchema).toBeDefined();
        });

        test('generates valid FAQPage schema', async () => {
            const content = await generateAnswerContent({
                brandName: 'Test Brand',
                brandDomain: 'test.com',
                question: 'Test question?',
                intent: 'INFORMATIONAL'
            });

            const faqSchema = content.schemaBlocks.find(b => b.schemaType === 'FAQPage');
            expect(faqSchema).toBeDefined();

            // Parse and validate JSON-LD
            const schema = JSON.parse(faqSchema!.code);
            expect(schema['@type']).toBe('FAQPage');
            expect(schema.mainEntity).toBeInstanceOf(Array);
            expect(schema.mainEntity.length).toBeGreaterThan(0);
            expect(schema.mainEntity[0]['@type']).toBe('Question');
        });

        test('generates valid WebPage schema', async () => {
            const content = await generateAnswerContent({
                brandName: 'Test Brand',
                brandDomain: 'test.com',
                question: 'Test question?',
                intent: 'INFORMATIONAL'
            });

            const webPageSchema = content.schemaBlocks.find(b => b.schemaType === 'WebPage');
            expect(webPageSchema).toBeDefined();

            // Parse and validate JSON-LD
            const schema = JSON.parse(webPageSchema!.code);
            expect(schema['@type']).toBe('WebPage');
            expect(schema.name).toBeDefined();
            expect(schema.description).toBeDefined();
            expect(schema.url).toContain('test.com');
        });

        test('includes brand name in generated content', async () => {
            const brandName = 'UniqueTestBrand123';
            const content = await generateAnswerContent({
                brandName,
                brandDomain: 'test.com',
                question: 'Test question?',
                intent: 'INFORMATIONAL'
            });

            // Brand should appear in title or snippet
            const hasBrandInTitle = content.title.includes(brandName);
            const hasBrandInSnippet = content.headlineSnippet.includes(brandName);
            expect(hasBrandInTitle || hasBrandInSnippet).toBe(true);
        });

        test('generates different content for different intents', async () => {
            const baseInput = {
                brandName: 'Test Brand',
                brandDomain: 'test.com',
                question: 'Test question?'
            };

            const informational = await generateAnswerContent({
                ...baseInput,
                intent: 'INFORMATIONAL'
            });

            const commercial = await generateAnswerContent({
                ...baseInput,
                intent: 'COMMERCIAL'
            });

            // Snippets should be different
            expect(informational.headlineSnippet).not.toBe(commercial.headlineSnippet);

            // Section types might differ
            const infoSectionTypes = informational.sections.map(s => s.type);
            const commSectionTypes = commercial.sections.map(s => s.type);

            // At least one section type should be different
            const hasDifferentTypes = infoSectionTypes.some(
                (type, idx) => type !== commSectionTypes[idx]
            );
            expect(hasDifferentTypes).toBe(true);
        });
    });
});
