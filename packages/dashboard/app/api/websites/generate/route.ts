import { NextRequest, NextResponse } from 'next/server';
import { AstroAppBuilder } from './buildHandler'

export async function POST(request: NextRequest) {
    const body = await request.json();
    const websiteRowData = body?.data;

    if (!websiteRowData) {
        return new Response(
            JSON.stringify({ error: "Missing 'Astro project info (csv row data)' payload" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
        );
    } else {
        // Return the streaming response from AstroAppBuilder
        return AstroAppBuilder(websiteRowData);
    }
}
