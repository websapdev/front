import { NextResponse } from 'next/server';
import { publishAnswerPage } from '@/lib/answerHub/service';

export async function POST(
    request: Request,
    { params }: { params: { id: string; answerPageId: string } }
) {
    try {
        const { id: brandId, answerPageId } = params;

        const updatedPage = await publishAnswerPage({
            brandId,
            answerPageId
        });

        return NextResponse.json({
            success: true,
            answerPage: updatedPage
        });
    } catch (error: any) {
        console.error('Error publishing answer page:', error);
        return new NextResponse(error.message, { status: 400 });
    }
}
