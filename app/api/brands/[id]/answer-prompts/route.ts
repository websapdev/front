import { NextResponse } from 'next/server';
import { createAnswerPromptForBrand } from '@/lib/answerHub/service';
import { prisma } from '@/lib/aiVisibility';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const brandId = params.id;
        const body = await request.json();

        if (!body.question) {
            return new NextResponse("Question is required", { status: 400 });
        }

        const prompt = await createAnswerPromptForBrand({
            brandId,
            question: body.question,
            intent: body.intent,
            priority: body.priority
        });

        return NextResponse.json(prompt);
    } catch (error: any) {
        console.error('Error creating prompt:', error);
        return new NextResponse(error.message, { status: 400 });
    }
}

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const brandId = params.id;
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        const prompts = await prisma.answerPrompt.findMany({
            where: {
                brandId,
                ...(status && { status })
            },
            orderBy: [
                { priority: 'desc' },
                { createdAt: 'desc' }
            ],
            include: {
                answerPage: {
                    select: {
                        id: true,
                        title: true,
                        isPublished: true,
                        urlPath: true,
                        lastGeneratedAt: true
                    }
                }
            }
        });

        return NextResponse.json(prompts);
    } catch (error: any) {
        console.error('Error fetching prompts:', error);
        return new NextResponse(error.message, { status: 500 });
    }
}
