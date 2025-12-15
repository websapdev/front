import { NextResponse } from 'next/server';
import { runAiVisibilityPollForBrand } from '@/lib/aiVisibility';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { brandId } = body;

        if (!brandId) {
            return new NextResponse("Missing brandId", { status: 400 });
        }

        // In a real app, verify this is an internal admin or authorized user

        const result = await runAiVisibilityPollForBrand(brandId);

        return NextResponse.json({ success: true, ...result });
    } catch (error: any) {
        console.error('Error running poll:', error);
        return new NextResponse(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
