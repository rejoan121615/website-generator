import { NextResponse } from "next/server";
import { GetReadyToBuildList, FetchWebsites } from "./websiteDataOperation";
import type {
  WebsitesResTYPE,
} from "@/types/dashboard.type";
import { WebsiteRowTYPE } from "@repo/shared-types";

export async function GET(): Promise<NextResponse<WebsitesResTYPE>> {
  try {
    const { SUCCESS, DATA } = await FetchWebsites();
    if (!SUCCESS) {
      return NextResponse.json(
        {
          SUCCESS: false,
          MESSAGE: "Failed to retrieve website CSV data.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      {
        SUCCESS: true,
        MESSAGE: "Website CSV data retrieved successfully.",
        DATA: DATA as WebsiteRowTYPE[],
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    const typedError = error as WebsitesResTYPE;
    console.log("error => ", error);
    return NextResponse.json(
      {
        SUCCESS: false,
        MESSAGE: typedError.MESSAGE,
      },
      {
        status: 500,
      }
    );
  }
}
