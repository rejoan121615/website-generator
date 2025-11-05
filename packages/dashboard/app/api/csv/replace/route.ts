import { NextRequest, NextResponse } from "next/server";
import fs from "fs-extra";
import path from "path";
import { stringify } from "csv-stringify/sync";
import { ProjectRoot } from "@/lib/assists";
import { CsvRowDataType, CsvHeaderKey } from "@repo/shared-types";
import { CsvReplaceApiResponse } from "@/types/dashboard.type";


export async function POST(request: NextRequest): Promise<NextResponse<CsvReplaceApiResponse>> {
  try {
    console.log("CSV Replace API - Starting replace operation...");
    
    // Parse request body
    const body = await request.json();
    const { newData } = body as { newData: CsvRowDataType[] };

    if (!newData || !Array.isArray(newData) || newData.length === 0) {
      console.log("No new data provided for replace");
      return NextResponse.json({
        SUCCESS: false,
        MESSAGE: "No new data provided for replace operation"
      }, { status: 400 });
    }

    console.log(`Received ${newData.length} records for replace operation`);

    // Path to the websites CSV file
    const websitesCsvPath = path.resolve(ProjectRoot(), "data", "websites.csv");
    console.log(`Target CSV file: ${websitesCsvPath}`);

    // Ensure the data directory exists
    await fs.ensureDir(path.dirname(websitesCsvPath));

    // Create backup of existing file if it exists
    if (await fs.pathExists(websitesCsvPath)) {
      const backupPath = `${websitesCsvPath}.backup.${Date.now()}`;
      await fs.copy(websitesCsvPath, backupPath);
      console.log(`Created backup at: ${backupPath}`);
    }

    // Convert new data to CSV format
    const csvContent = stringify(newData, {
      header: true,
      columns: CsvHeaderKey
    });

    // Write new data to CSV file (replacing existing content)
    await fs.writeFile(websitesCsvPath, csvContent, 'utf-8');
    
    console.log(`Successfully replaced CSV data at ${websitesCsvPath}`);
    console.log(`Total records written: ${newData.length}`);

    return NextResponse.json({
      SUCCESS: true,
      MESSAGE: `Successfully replaced CSV data with ${newData.length} new records`,
      DATA: {
        totalRecords: newData.length,
        replacedRecords: newData.length
      }
    }, { status: 200 });

  } catch (error) {
    console.error("CSV Replace Error:", error);
    
    let errorMessage = "Failed to replace CSV data";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({
      SUCCESS: false,
      MESSAGE: errorMessage
    }, { status: 500 });
  }
}