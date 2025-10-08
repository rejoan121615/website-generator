import { NextResponse } from "next/server";
import { GetReadyToBuildList, GetWebsiteCsvData } from "./utilities";
import type {
  GetApiResTYPE,
  WebsiteRowTYPE,
  WebsitesResTYPE,
} from "@/types/websiteApi.type";

export async function GET(): Promise<NextResponse<GetApiResTYPE>> {
  try {
    const { DATA: CsvData } = await GetWebsiteCsvData();
    const { DATA: ReadyToBuildData } = await GetReadyToBuildList();

    if (CsvData && ReadyToBuildData) {
      const WebsiteRowData: WebsiteRowTYPE[] = CsvData.map((csvItem) => {

        const { domain } = csvItem;

        const buildStatus = ReadyToBuildData.find((item) => item === domain);

        return {
          ...csvItem,
          build: buildStatus === undefined ? "unavailable" : "complete",
          deployed: "unavailable",
        };
      });

    return NextResponse.json({
      SUCCESS: true,
      MESSAGE: "Websites fetched successfully.",
      DATA: WebsiteRowData,
    });
    }

    // default return 
    return NextResponse.json({
      SUCCESS: true,
      MESSAGE: "No websites data found.",
      DATA: [],
    });
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
