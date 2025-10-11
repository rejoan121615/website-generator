import { GetApiResTYPE, WebsiteRowTYPE } from "@/types/websiteApi.type";
import { NextResponse } from "next/server";
import { deploy } from "@repo/cf";

export async function POST(
  request: Request
): Promise<NextResponse<GetApiResTYPE>> {
  const body = await request.json();

  const websiteRowData = body?.data as WebsiteRowTYPE;

  if (!websiteRowData) {
    return NextResponse.json(
      {
        SUCCESS: false,
        MESSAGE: "No data provided",
      },
      {
        status: 400,
      }
    );
  }

  await deploy({
    domainName: websiteRowData.domain,
    projectName: websiteRowData.name,
    branchName: "main",
  });

  return NextResponse.json(
    {
      SUCCESS: false,
      MESSAGE: "Not implemented",
    },
    {
      status: 501,
    }
  );
}
