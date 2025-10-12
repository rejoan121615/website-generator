import { NextResponse } from "next/server";
import { GetReadyToBuildList, GetWebsiteCsvData } from "./utilities";
import type {
  GetApiResTYPE,
  WebsiteRowTYPE,
  WebsitesResTYPE,
} from "@/types/websiteApi.type";

export async function GET(): Promise<NextResponse<GetApiResTYPE>> {
  try {
    const { SUCCESS, DATA: CsvData } = await GetWebsiteCsvData();
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
    };

    if (!CsvData || CsvData.length === 0) {
      return NextResponse.json({
        SUCCESS: true,
        MESSAGE: "No website data found.",
        DATA: [],
      });
    }

    const { DATA: ReadyToBuildData } = await GetReadyToBuildList({ csvRowData: CsvData });



    // default return
    return NextResponse.json({
      SUCCESS: true,
      MESSAGE: "Website data retrieved successfully.",
      DATA: ReadyToBuildData,
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
