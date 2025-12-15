import { NextResponse } from 'next/server';
import { getVisibilityOverview } from '@/lib/aiVisibility';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const brandId = params.id;
        // In a real app, verify user ownership here:
        // const session = await getServerSession();
        // if (!session || !ownsBrand(session.user.id, brandId)) return new NextResponse("Unauthorized", { status: 401 });

        const data = await getVisibilityOverview(brandId);
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching visibility overview:', error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
