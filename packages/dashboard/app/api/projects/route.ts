import { NextResponse, NextRequest } from "next/server";
import { FetchProjects, ProjectsResTYPE } from "@repo/cf";


export async function GET(): Promise<NextResponse<ProjectsResTYPE>> {
  try {
    const { DATA, MESSAGE, SUCCESS } = await FetchProjects();

    
    if (DATA === undefined || !Array.isArray(DATA)) {
        return NextResponse.json({
            SUCCESS,
            MESSAGE,
            DATA: [],
        });
    } 

   return NextResponse.json({
    SUCCESS: true,
    MESSAGE,
    DATA,
   })
    
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
