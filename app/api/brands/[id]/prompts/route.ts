import { NextResponse } from 'next/server';
import { prisma } from '@/lib/aiVisibility';

export const dynamic = 'force-dynamic';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const brandId = params.id;
        const body = await request.json();

        if (!body.text) {
            return new NextResponse("Missing prompt text", { status: 400 });
        }

        const prompt = await prisma.trackedPrompt.create({
            data: {
                brandId,
                text: body.text,
                isActive: true
            }
        });

        return NextResponse.json(prompt);
    } catch (error) {
        console.error('Error creating prompt:', error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const brandId = params.id;
        const prompts = await prisma.trackedPrompt.findMany({
            where: { brandId, isActive: true },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(prompts);
    } catch (error) {
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
