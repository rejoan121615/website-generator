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

  const deploymentResult = await deploy({
    domainName: websiteRowData.domain,
    branchName: "main",
  });

  if (!deploymentResult || !deploymentResult.SUCCESS) {
    return NextResponse.json(
      {
        SUCCESS: false,
        MESSAGE: "Site deployment failed",
      },
      {
        status: 500,
      }
    );
  }

  return NextResponse.json(
    {
      SUCCESS: true,
      MESSAGE: "Site deployed successfully",
      DATA: deploymentResult.DATA,
    },
    {
      status: 200,
    }
  );
}
