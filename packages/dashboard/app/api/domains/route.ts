import { NextResponse, NextRequest } from "next/server";
import { FetchDomains } from "@repo/cf";
import { DomainApiResTYPE } from "@/types/websiteApi.type";

export async function GET(): Promise<NextResponse<DomainApiResTYPE>> {
  try {
    const { DATA, MESSAGE, SUCCESS } = await FetchDomains();
    
    if (DATA === undefined || !Array.isArray(DATA)) {
        return NextResponse.json({
            SUCCESS,
            MESSAGE,
            DATA
        });
    } 

    return NextResponse.json({
      SUCCESS,
      MESSAGE,
      DATA  
    }, {
        status: 200,
    });
    
    
  } catch (error) {
    console.error("Error fetching domains:", error);
    return NextResponse.json({
      SUCCESS: false,
      MESSAGE: "Failed to fetch domains",
    }, {
        status: 500,
    });
  }
}
