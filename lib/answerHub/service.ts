// lib/answerHub/service.ts
// Service layer for Answer Hub operations with Prisma

import { prisma } from '../aiVisibility';
import { generateAnswerContent, slugifyQuestion, type AnswerIntent } from './generator';
import { AnswerPage } from '@prisma/client';

export type { AnswerIntent };

/**
 * Creates a new AnswerPrompt for a brand
 */
export async function createAnswerPromptForBrand(args: {
    brandId: string;
    question: string;
    intent?: AnswerIntent;
    priority?: number;
}): Promise<any> {
    const { brandId, question, intent = "UNKNOWN", priority = 0 } = args;

    // Generate slug from question
    const slug = slugifyQuestion(question);

    // Check for existing prompt with same slug
    const existing = await prisma.answerPrompt.findUnique({
        where: {
            brandId_slug: {
                brandId,
                slug
            }
        }
    });

    if (existing) {
        throw new Error(`A prompt with similar question already exists for this brand`);
    }

    // Create the prompt
    const prompt = await prisma.answerPrompt.create({
        data: {
            brandId,
            question,
            slug,
            status: "DRAFT",
            intent,
            priority
        }
    });

    return prompt;
}

/**
 * Generates or regenerates an AnswerPage for a given prompt
 */
export async function generateOrRegenerateAnswerPageForPrompt(args: {
    brandId: string;
    promptId: string;
}): Promise<{ answerPage: any }> {
    const { brandId, promptId } = args;

    // Load prompt and brand
    const prompt = await prisma.answerPrompt.findUnique({
        where: { id: promptId },
        include: { brand: true }
    });

    if (!prompt) {
        throw new Error('Prompt not found');
    }

    if (prompt.brandId !== brandId) {
        throw new Error('Prompt does not belong to this brand');
    }

    const brand = prompt.brand;

    // Generate content using AI generator
    const generatedContent = await generateAnswerContent({
        brandName: brand.name,
        brandDomain: brand.primaryDomain,
        question: prompt.question,
        intent: prompt.intent as AnswerIntent
    });

    const now = new Date();
    const urlPath = `/ai-answers/${prompt.slug}`;

    // Check if answer page already exists
    const existingPage = await prisma.answerPage.findUnique({
        where: { answerPromptId: promptId }
    });

    let answerPage: AnswerPage;

    if (existingPage) {
        // Delete existing sections, FAQ items, and schema blocks
        await prisma.answerSection.deleteMany({
            where: { answerPageId: existingPage.id }
        });
        await prisma.answerFaqItem.deleteMany({
            where: { answerPageId: existingPage.id }
        });
        await prisma.answerSchemaBlock.deleteMany({
            where: { answerPageId: existingPage.id }
        });

        // Update the page
        answerPage = await prisma.answerPage.update({
            where: { id: existingPage.id },
            data: {
                title: generatedContent.title,
                headlineSnippet: generatedContent.headlineSnippet,
                lastGeneratedAt: now
            }
        });
    } else {
        // Create new page
        answerPage = await prisma.answerPage.create({
            data: {
                brandId,
                answerPromptId: promptId,
                title: generatedContent.title,
                slug: prompt.slug,
                urlPath,
                headlineSnippet: generatedContent.headlineSnippet,
                lastGeneratedAt: now
            }
        });
    }

    // Create sections
    await Promise.all(
        generatedContent.sections.map((section, index) =>
            prisma.answerSection.create({
                data: {
                    answerPageId: answerPage.id,
                    order: index,
                    heading: section.heading,
                    body: section.body,
                    type: section.type
                }
            })
        )
    );

    // Create FAQ items
    await Promise.all(
        generatedContent.faqItems.map(item =>
            prisma.answerFaqItem.create({
                data: {
                    answerPageId: answerPage.id,
                    question: item.question,
                    answer: item.answer
                }
            })
        )
    );

    // Create schema blocks
    await Promise.all(
        generatedContent.schemaBlocks.map(block =>
            prisma.answerSchemaBlock.create({
                data: {
                    answerPageId: answerPage.id,
                    schemaType: block.schemaType,
                    code: block.code,
                    generatedAt: now
                }
            })
        )
    );

    // Update prompt status
    await prisma.answerPrompt.update({
        where: { id: promptId },
        data: {
            status: prompt.status === "DRAFT" ? "GENERATED" : prompt.status
        }
    });

    return { answerPage };
}

/**
 * Publishes an AnswerPage
 */
export async function publishAnswerPage(args: {
    brandId: string;
    answerPageId: string;
}): Promise<any> {
    const { brandId, answerPageId } = args;

    const page = await prisma.answerPage.findUnique({
        where: { id: answerPageId },
        include: { answerPrompt: true }
    });

    if (!page) {
        throw new Error('Answer page not found');
    }

    if (page.brandId !== brandId) {
        throw new Error('Answer page does not belong to this brand');
    }

    const now = new Date();

    // Update page
    const updatedPage = await prisma.answerPage.update({
        where: { id: answerPageId },
        data: {
            isPublished: true,
            publishedAt: now
        }
    });

    // Update prompt status
    await prisma.answerPrompt.update({
        where: { id: page.answerPromptId },
        data: {
            status: "PUBLISHED"
        }
    });

    return updatedPage;
}

/**
 * Unpublishes an AnswerPage
 */
export async function unpublishAnswerPage(args: {
    brandId: string;
    answerPageId: string;
}): Promise<any> {
    const { brandId, answerPageId } = args;

    const page = await prisma.answerPage.findUnique({
        where: { id: answerPageId }
    });

    if (!page) {
        throw new Error('Answer page not found');
    }

    if (page.brandId !== brandId) {
        throw new Error('Answer page does not belong to this brand');
    }

    // Update page
    const updatedPage = await prisma.answerPage.update({
        where: { id: answerPageId },
        data: {
            isPublished: false
        }
    });

    // Update prompt status back to GENERATED
    await prisma.answerPrompt.update({
        where: { id: page.answerPromptId },
        data: {
            status: "GENERATED"
        }
    });

    return updatedPage;
}

/**
 * Updates an AnswerPage with manual edits
 */
export async function updateAnswerPage(args: {
    brandId: string;
    answerPageId: string;
    title?: string;
    headlineSnippet?: string;
    metaDescription?: string;
    sections?: Array<{
        id?: string;
        order: number;
        heading: string;
        body: string;
        type: string;
    }>;
    faqItems?: Array<{
        id?: string;
        question: string;
        answer: string;
    }>;
}): Promise<any> {
    const { brandId, answerPageId, title, headlineSnippet, metaDescription, sections, faqItems } = args;

    const page = await prisma.answerPage.findUnique({
        where: { id: answerPageId }
    });

    if (!page) {
        throw new Error('Answer page not found');
    }

    if (page.brandId !== brandId) {
        throw new Error('Answer page does not belong to this brand');
    }

    const now = new Date();

    // Update basic fields
    const updatedPage = await prisma.answerPage.update({
        where: { id: answerPageId },
        data: {
            ...(title && { title }),
            ...(headlineSnippet && { headlineSnippet }),
            ...(metaDescription !== undefined && { metaDescription }),
            lastEditedAt: now
        }
    });

    // Update sections if provided
    if (sections) {
        // Delete existing sections
        await prisma.answerSection.deleteMany({
            where: { answerPageId }
        });

        // Create new sections
        await Promise.all(
            sections.map(section =>
                prisma.answerSection.create({
                    data: {
                        answerPageId,
                        order: section.order,
                        heading: section.heading,
                        body: section.body,
                        type: section.type
                    }
                })
            )
        );
    }

    // Update FAQ items if provided
    if (faqItems) {
        // Delete existing FAQ items
        await prisma.answerFaqItem.deleteMany({
            where: { answerPageId }
        });

        // Create new FAQ items
        await Promise.all(
            faqItems.map(item =>
                prisma.answerFaqItem.create({
                    data: {
                        answerPageId,
                        question: item.question,
                        answer: item.answer
                    }
                })
            )
        );
    }

    return updatedPage;
}
