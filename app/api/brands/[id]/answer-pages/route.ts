import { NextResponse } from 'next/server';
import { prisma } from '@/lib/aiVisibility';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const brandId = params.id;

        const pages = await prisma.answerPage.findMany({
            where: { brandId },
            orderBy: { createdAt: 'desc' },
            include: {
                answerPrompt: {
                    select: {
                        question: true,
                        status: true,
                        intent: true
                    }
                },
                _count: {
                    select: {
                        sections: true,
                        faqItems: true
                    }
                }
            }
        });

        return NextResponse.json(pages);
    } catch (error: any) {
        console.error('Error fetching answer pages:', error);
        return new NextResponse(error.message, { status: 500 });
    }
}
