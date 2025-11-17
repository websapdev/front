
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create test user with admin privileges
  const hashedPassword = await bcrypt.hash('johndoe123', 12)
  
  const user = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      name: 'John Doe',
      password: hashedPassword,
    },
  })

  console.log('Test user created:', user.email)

  // Create sample audit data
  const sampleAudits = [
    {
      domain: 'example.com',
      status: 'COMPLETED' as const,
      progress: 100,
      message: 'Audit completed successfully',
      results: {
        performance: 88,
        seo: 94,
        accessibility: 82,
        issues: 24
      },
      completedAt: new Date(),
    },
    {
      domain: 'test-site.com',
      status: 'COMPLETED' as const,
      progress: 100,
      message: 'Audit completed successfully',
      results: {
        performance: 72,
        seo: 86,
        accessibility: 78,
        issues: 18
      },
      completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    },
  ]

  for (const auditData of sampleAudits) {
    await prisma.audit.create({
      data: {
        ...auditData,
        userId: user.id,
      },
    })
  }

  console.log('Sample audit data seeded')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
