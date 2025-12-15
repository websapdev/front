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

        if (!body.name) {
            return new NextResponse("Missing competitor name", { status: 400 });
        }

        const competitor = await prisma.competitor.create({
            data: {
                brandId,
                name: body.name,
                primaryDomain: body.primaryDomain || ''
            }
        });

        return NextResponse.json(competitor);
    } catch (error) {
        console.error('Error creating competitor:', error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
