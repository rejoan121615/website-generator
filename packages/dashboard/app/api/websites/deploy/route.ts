import { NextResponse } from "next/server";
import { DeployProject, DeployResTYPE } from "@repo/cf";
import { WebsiteRowTYPE } from "@repo/shared-types";

export async function POST(
  request: Request
): Promise<NextResponse<DeployResTYPE>> {
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

  const deploymentResult = await DeployProject({
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
