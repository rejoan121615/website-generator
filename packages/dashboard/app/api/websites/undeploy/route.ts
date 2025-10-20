import { deleteProject, DeleteProjectResTYPE } from '@repo/cf';
import { NextRequest, NextResponse } from 'next/server'
import { APIError } from 'cloudflare'
import { WebsiteRowTYPE } from '@repo/shared-types';

export async function POST(request: NextRequest) : Promise<NextResponse<DeleteProjectResTYPE>> {
    const body = await request.json();
    const websiteRowData = body?.data as WebsiteRowTYPE;

    if (!websiteRowData) {
        return NextResponse.json({
            SUCCESS: false,
            MESSAGE: "Website data is required",
        });
    }

    try {
        const result = await deleteProject({ domainName: websiteRowData.domain });
        return NextResponse.json(result);
    } catch (error) {
        const err = error instanceof APIError ? error : null;

        if (err) {
            console.log(err.errors[0]?.message)
            return NextResponse.json({
                SUCCESS: false,
                MESSAGE: "Failed to delete project",
                ERROR: err || undefined,
            });
        }

        return NextResponse.json({
            SUCCESS: false,
            MESSAGE: "An unexpected error occurred",
        });
    }
}