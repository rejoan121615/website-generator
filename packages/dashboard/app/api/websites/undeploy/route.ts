import { GetApiResTYPE, WebsiteRowTYPE } from '@/types/websiteApi.type';
import { deleteProject } from '@repo/cf';
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) : Promise<NextResponse<GetApiResTYPE>> {
    const body = await request.json();
    const websiteRowData = body?.data as WebsiteRowTYPE;

    if (!websiteRowData) {
        return NextResponse.json({
            SUCCESS: false,
            MESSAGE: "Website data is required",
        });
    }

    try {
        const result = await deleteProject({ projectName: websiteRowData.domain });
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({
            SUCCESS: false,
            MESSAGE: "Failed to delete project",
        });
    }
}