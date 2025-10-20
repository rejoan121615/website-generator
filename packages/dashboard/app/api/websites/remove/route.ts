import { astroProjectRemover } from "@repo/app-generator/app-bundler";
import { NextResponse } from "next/server";
import { EventResType } from '@repo/shared-types'

export async function POST(
  request: Request
): Promise<NextResponse<EventResType>> {
  const body = await request.json();
  const websiteRowData = body?.data;

  if (!websiteRowData) {
    return NextResponse.json(
      {
        SUCCESS: false,
        MESSAGE: "Missing 'Astro project info (csv row data)' payload",
      },
      { status: 400 }
    );
  }

  try {
    await astroProjectRemover(websiteRowData);
    return NextResponse.json({
      SUCCESS: true,
      MESSAGE: "Project removed successfully",
    });
  } catch (error) {
    return NextResponse.json({
      SUCCESS: false,
      MESSAGE: "Failed to remove project",
    });
  }
}
