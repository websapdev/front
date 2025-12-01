import { PrismaClient } from '@prisma/client';

// Use a global variable to prevent multiple Prisma instances in dev
const globalForPrisma = global as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// --- Types ---

interface AiEngineStub {
    id: string;
    slug: string;
    displayName: string;
}

// --- 1. AI Engine Polling & Parsing ---

/**
 * Stubs fetching from an AI engine.
 * In a real app, this would call OpenAI, Perplexity API, etc.
 */
async function fetchFromAiEngine(engine: AiEngineStub, prompt: string, brandName: string, competitorNames: string[]): Promise<string> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const isPositive = Math.random() > 0.3;
    const includeCompetitor = Math.random() > 0.4;
    const competitor = competitorNames[Math.floor(Math.random() * competitorNames.length)] || "CompetitorX";

    // Generate deterministic-looking but random response
    if (engine.slug === 'chatgpt') {
        return `Here is a comparison. ${brandName} is a leading solution known for its robust features. ${isPositive ? 'Users love the interface.' : 'However, some find it expensive.'} ${includeCompetitor ? `Alternatively, ${competitor} offers a cheaper price point but fewer features.` : ''}`;
    } else if (engine.slug === 'perplexity') {
        return `Based on search results, ${brandName} is frequently mentioned as a top choice. ${includeCompetitor ? `${competitor} is also a strong contender in the market.` : ''} ${brandName} has excellent support.`;
    } else {
        return `${brandName} provides a comprehensive platform. ${includeCompetitor ? `Compared to ${competitor}, it is more enterprise-focused.` : ''}`;
    }
}

/**
 * Simple rule-based sentiment analysis
 */
export function inferSentiment(text: string, entity: string): 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' {
    const lowerText = text.toLowerCase();
    const lowerEntity = entity.toLowerCase();

    // Very basic proximity check (in real life, use NLP)
    const sentence = lowerText.split('.').find(s => s.includes(lowerEntity)) || lowerText;

    if (sentence.includes('love') || sentence.includes('excellent') || sentence.includes('leading') || sentence.includes('top choice') || sentence.includes('robust')) {
        return 'POSITIVE';
    }
    if (sentence.includes('expensive') || sentence.includes('slow') || sentence.includes('hard') || sentence.includes('bad')) {
        return 'NEGATIVE';
    }
    return 'NEUTRAL';
}

/**
 * Extracts mentions from the raw answer
 */
export function extractMentions(rawAnswer: string, brandName: string, competitorNames: string[]) {
    const mentions = [];
    const lowerAnswer = rawAnswer.toLowerCase();

    // Check Brand
    if (lowerAnswer.includes(brandName.toLowerCase())) {
        mentions.push({
            entityType: 'BRAND',
            entityName: brandName,
            sentiment: inferSentiment(rawAnswer, brandName),
            isRecommendation: rawAnswer.toLowerCase().includes(`recommend ${brandName.toLowerCase()}`) || rawAnswer.includes('top choice')
        });
    }

    // Check Competitors
    for (const comp of competitorNames) {
        if (lowerAnswer.includes(comp.toLowerCase())) {
            mentions.push({
                entityType: 'COMPETITOR',
                entityName: comp,
                sentiment: inferSentiment(rawAnswer, comp),
                isRecommendation: rawAnswer.toLowerCase().includes(`recommend ${comp.toLowerCase()}`)
            });
        }
    }

    return mentions;
}

/**
 * Main Worker Function: Runs the poll for a specific brand
 */
export async function runAiVisibilityPollForBrand(brandId: string) {
    console.log(`Starting poll for brand ${brandId}...`);

    const brand = await prisma.brand.findUnique({
        where: { id: brandId },
        include: { competitors: true, prompts: { where: { isActive: true } } }
    });

    if (!brand) throw new Error(`Brand ${brandId} not found`);

    const engines = await prisma.aiEngine.findMany();
    const competitorNames = brand.competitors.map((c: any) => c.name);

    let newAnswersCount = 0;

    for (const prompt of brand.prompts) {
        for (const engine of engines) {
            // 1. Fetch
            const rawAnswer = await fetchFromAiEngine(engine, prompt.text, brand.name, competitorNames);

            // 2. Save Answer
            const aiAnswer = await prisma.aiAnswer.create({
                data: {
                    brandId: brand.id,
                    trackedPromptId: prompt.id,
                    aiEngineId: engine.id,
                    rawAnswer: rawAnswer,
                }
            });
            newAnswersCount++;

            // 3. Parse & Save Mentions
            const mentions = extractMentions(rawAnswer, brand.name, competitorNames);
            for (const m of mentions) {
                await prisma.mention.create({
                    data: {
                        aiAnswerId: aiAnswer.id,
                        entityType: m.entityType,
                        entityName: m.entityName,
                        sentiment: m.sentiment,
                        isRecommendation: m.isRecommendation
                    }
                });
            }
        }
    }

    // 4. Update Daily Snapshot (Simplified: just recompute for "today")
    await updateDailySnapshot(brand.id);

    return { newAnswers: newAnswersCount };
}

async function updateDailySnapshot(brandId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const engines = await prisma.aiEngine.findMany();

    for (const engine of engines) {
        const answers = await prisma.aiAnswer.findMany({
            where: {
                brandId,
                aiEngineId: engine.id,
                askedAt: { gte: today }
            },
            include: { mentions: true }
        });

        if (answers.length === 0) continue;

        let brandMentions = 0;
        let competitorMentions = 0;
        const competitorCounts: Record<string, number> = {};

        for (const a of answers) {
            for (const m of a.mentions) {
                if (m.entityType === 'BRAND') brandMentions++;
                if (m.entityType === 'COMPETITOR') {
                    competitorMentions++;
                    competitorCounts[m.entityName] = (competitorCounts[m.entityName] || 0) + 1;
                }
            }
        }

        const totalMentions = brandMentions + competitorMentions;
        const brandSov = totalMentions > 0 ? brandMentions / totalMentions : 0;

        // Upsert Snapshot
        await prisma.visibilitySnapshot.upsert({
            where: {
                brandId_aiEngineId_date: {
                    brandId,
                    aiEngineId: engine.id,
                    date: today
                }
            },
            update: {
                totalAnswers: answers.length,
                brandMentionCount: brandMentions,
                competitorMentionCount: competitorMentions,
                brandShareOfVoice: brandSov,
                competitorShareOfVoice: JSON.stringify(competitorCounts)
            },
            create: {
                brandId,
                aiEngineId: engine.id,
                date: today,
                totalAnswers: answers.length,
                brandMentionCount: brandMentions,
                competitorMentionCount: competitorMentions,
                brandShareOfVoice: brandSov,
                competitorShareOfVoice: JSON.stringify(competitorCounts)
            }
        });
    }
}


// --- 3. Metrics Service ---

export async function getVisibilityOverview(brandId: string) {
    // Get last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const snapshots = await prisma.visibilitySnapshot.findMany({
        where: {
            brandId,
            date: { gte: thirtyDaysAgo }
        },
        include: { aiEngine: true },
        orderBy: { date: 'asc' }
    });

    // Aggregations
    let totalAnswers = 0;
    let totalBrandMentions = 0;
    let totalCompetitorMentions = 0;

    // Per Engine
    const perEngine: Record<string, any> = {};

    // Trend
    const trendMap: Record<string, any> = {};

    for (const s of snapshots) {
        totalAnswers += s.totalAnswers;
        totalBrandMentions += s.brandMentionCount;
        totalCompetitorMentions += s.competitorMentionCount;

        // Engine Stats
        if (!perEngine[s.aiEngine.displayName]) {
            perEngine[s.aiEngine.displayName] = { brand: 0, total: 0 };
        }
        perEngine[s.aiEngine.displayName].brand += s.brandMentionCount;
        perEngine[s.aiEngine.displayName].total += (s.brandMentionCount + s.competitorMentionCount);

        // Trend
        const dateKey = s.date.toISOString().split('T')[0];
        if (!trendMap[dateKey]) {
            trendMap[dateKey] = { date: dateKey, brandMentions: 0, totalMentions: 0 };
        }
        trendMap[dateKey].brandMentions += s.brandMentionCount;
        trendMap[dateKey].totalMentions += (s.brandMentionCount + s.competitorMentionCount);
    }

    // Calculate SOV for Trend
    const trend = Object.values(trendMap).map((t: any) => ({
        date: t.date,
        brandSov: t.totalMentions > 0 ? (t.brandMentions / t.totalMentions) * 100 : 0
    }));

    // Calculate SOV for Engines
    const engineChart = Object.keys(perEngine).map(name => ({
        name,
        sov: perEngine[name].total > 0 ? (perEngine[name].brand / perEngine[name].total) * 100 : 0
    }));

    const overallSov = (totalBrandMentions + totalCompetitorMentions) > 0
        ? (totalBrandMentions / (totalBrandMentions + totalCompetitorMentions)) * 100
        : 0;

    // Get Top Prompts (simplified: just list them with answer counts)
    const prompts = await prisma.trackedPrompt.findMany({
        where: { brandId, isActive: true },
        include: { _count: { select: { answers: true } } }
    });

    return {
        headline: {
            overallSov: Math.round(overallSov),
            totalAnswers,
            competitorsTracked: await prisma.competitor.count({ where: { brandId } })
        },
        engineChart,
        trend,
        prompts: prompts.map((p: any) => ({
            id: p.id,
            text: p.text,
            answerCount: p._count.answers
        }))
    };
}
