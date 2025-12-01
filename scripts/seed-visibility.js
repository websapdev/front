const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding AI Visibility Data...');

    // 1. Create User
    const user = await prisma.user.upsert({
        where: { email: 'demo@vysalytica.com' },
        update: {},
        create: {
            email: 'demo@vysalytica.com',
        },
    });

    // 2. Create Brand
    const brand = await prisma.brand.create({
        data: {
            userId: user.id,
            name: 'Acme Corp',
            primaryDomain: 'acme.com',
        },
    });

    console.log(`Created Brand: ${brand.name} (${brand.id})`);

    // 3. Create Competitors
    await prisma.competitor.createMany({
        data: [
            { brandId: brand.id, name: 'Globex', primaryDomain: 'globex.com' },
            { brandId: brand.id, name: 'Soylent', primaryDomain: 'soylent.com' },
        ],
    });

    // 4. Create AI Engines
    await prisma.aiEngine.createMany({
        data: [
            { slug: 'chatgpt', displayName: 'ChatGPT' },
            { slug: 'perplexity', displayName: 'Perplexity' },
            { slug: 'google-ai', displayName: 'Google AI' },
        ],
    });

    // 5. Create Tracked Prompts
    await prisma.trackedPrompt.createMany({
        data: [
            { brandId: brand.id, text: 'Best enterprise software solutions 2025' },
            { brandId: brand.id, text: 'Acme Corp vs Globex reviews' },
            { brandId: brand.id, text: 'Top rated SaaS platforms for logistics' },
        ],
    });

    console.log('✅ Seeding Complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
