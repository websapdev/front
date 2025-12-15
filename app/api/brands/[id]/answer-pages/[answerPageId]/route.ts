import { NextResponse } from 'next/server';
import { prisma } from '@/lib/aiVisibility';
import { updateAnswerPage } from '@/lib/answerHub/service';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: { id: string; answerPageId: string } }
) {
    try {
        const { id: brandId, answerPageId } = params;

        const page = await prisma.answerPage.findUnique({
            where: { id: answerPageId },
            include: {
                answerPrompt: true,
                sections: {
                    orderBy: { order: 'asc' }
                },
                faqItems: true,
                schemaBlocks: true,
                metrics: {
                    orderBy: { date: 'desc' },
                    take: 30
                }
            }
        });

        if (!page) {
            return new NextResponse("Answer page not found", { status: 404 });
        }

        if (page.brandId !== brandId) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        // Calculate aggregated metrics
        const totalViews = page.metrics.reduce((sum, m) => sum + m.pageViews, 0);
        const totalClicks = page.metrics.reduce((sum, m) => sum + m.ctaClicks, 0);
        const aiTargetedDays = page.metrics.filter(m => m.aiTargeted).length;

        return NextResponse.json({
            ...page,
            aggregatedMetrics: {
                totalViews,
                totalClicks,
                aiTargetedDays
            }
        });
    } catch (error: any) {
        console.error('Error fetching answer page:', error);
        return new NextResponse(error.message, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string; answerPageId: string } }
) {
    try {
        const { id: brandId, answerPageId } = params;
        const body = await request.json();

        const updatedPage = await updateAnswerPage({
            brandId,
            answerPageId,
            title: body.title,
            headlineSnippet: body.headlineSnippet,
            metaDescription: body.metaDescription,
            sections: body.sections,
            faqItems: body.faqItems
        });

        return NextResponse.json(updatedPage);
    } catch (error: any) {
        console.error('Error updating answer page:', error);
        return new NextResponse(error.message, { status: 400 });
    }
}
