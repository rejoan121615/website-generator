import { GetApiResTYPE, WebsiteRowTYPE } from "@/types/websiteApi.type";
import { NextRequest, NextResponse } from "next/server";
import { FetchWebsites } from "../websites/websiteDataOperation";

export async function GET({}: {}): Promise<
  NextResponse<GetApiResTYPE>
> {
  try {
    const { SUCCESS, DATA, MESSAGE } = await FetchWebsites();

    // only send who is ready to deploy
    if (DATA && SUCCESS) {
      const readyForDomains = (DATA as WebsiteRowTYPE[]).filter(
        (website: WebsiteRowTYPE) => {
          return (
            website.build === "complete" && website.deployed === "complete"
          );
        }
      );

      if (!readyForDomains.length) {
        return NextResponse.json({
          SUCCESS: true,
          MESSAGE: "There is no website ready for domain",
          DATA: readyForDomains,
        });
      }

      return NextResponse.json({
        SUCCESS: true,
        MESSAGE: MESSAGE || "Websites fetched successfully",
        DATA: readyForDomains,
      });
    } else {
      return NextResponse.json({
        SUCCESS: true,
        MESSAGE: "Websites data not available",
        DATA: [],
      });
    }
  } catch (error) {
    return NextResponse.json({
      SUCCESS: false,
      MESSAGE: "Failed to fetch websites",
      DATA: [],
    });
  }
}
