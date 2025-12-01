const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Answer Hub data...');

    // Find or create demo user
    let user = await prisma.user.findUnique({
        where: { email: 'demo@vysalytica.com' }
    });

    if (!user) {
        user = await prisma.user.create({
            data: { email: 'demo@vysalytica.com' }
        });
    }

    // Create Acme Shoes brand
    const brand = await prisma.brand.create({
        data: {
            userId: user.id,
            name: 'Acme Shoes',
            primaryDomain: 'acme-shoes.example.com'
        }
    });

    console.log(`✅ Created brand: ${brand.name} (${brand.id})`);

    // Create sample questions
    const questions = [
        {
            question: 'Are Acme Shoes good for running?',
            intent: 'INFORMATIONAL',
            slug: 'are-acme-shoes-good-for-running'
        },
        {
            question: 'What makes Acme Shoes different from competitors?',
            intent: 'COMMERCIAL',
            slug: 'what-makes-acme-shoes-different-from-competitors'
        },
        {
            question: 'How much do Acme Shoes cost?',
            intent: 'TRANSACTIONAL',
            slug: 'how-much-do-acme-shoes-cost'
        }
    ];

    for (const q of questions) {
        const prompt = await prisma.answerPrompt.create({
            data: {
                brandId: brand.id,
                question: q.question,
                slug: q.slug,
                intent: q.intent,
                status: 'DRAFT'
            }
        });

        console.log(`✅ Created prompt: "${q.question}"`);
    }

    console.log('\n🎉 Answer Hub seeding complete!');
    console.log(`\n📍 Next steps:`);
    console.log(`1. Start your dev server: npm run dev`);
    console.log(`2. Access the Answer Hub at: http://localhost:3000/brands/${brand.id}/answer-hub`);
    console.log(`3. Click "Generate Answer" on any question to create AI-optimized content\n`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
