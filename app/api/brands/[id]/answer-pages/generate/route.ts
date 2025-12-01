import { NextResponse } from 'next/server';
import { generateOrRegenerateAnswerPageForPrompt } from '@/lib/answerHub/service';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const brandId = params.id;
        const body = await request.json();

        if (!body.promptId) {
            return new NextResponse("promptId is required", { status: 400 });
        }

        const result = await generateOrRegenerateAnswerPageForPrompt({
            brandId,
            promptId: body.promptId
        });

        return NextResponse.json({
            success: true,
            answerPage: result.answerPage
        });
    } catch (error: any) {
        console.error('Error generating answer page:', error);
        return new NextResponse(error.message, { status: 400 });
    }
}
