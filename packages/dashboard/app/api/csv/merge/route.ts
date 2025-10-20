import { NextRequest, NextResponse } from "next/server";
import fs from "fs-extra";
import path from "path";
import { stringify } from "csv-stringify/sync";
import { parse } from "csv-parse/sync";
import { ProjectRoot } from "@/lib/assists";
import type { CsvRowDataType } from "@/types/websiteApi.type";

type CsvMergeApiResponse = {
  SUCCESS: boolean;
  MESSAGE: string;
  DATA?: {
    totalRecords: number;
    newRecords: number;
    existingRecords: number;
  };
};

export async function POST(request: NextRequest): Promise<NextResponse<CsvMergeApiResponse>> {
  try {
    console.log("🔄 CSV Merge API - Starting merge operation...");
    
    // Parse request body
    const body = await request.json();
    const { newData } = body as { newData: CsvRowDataType[] };

    if (!newData || !Array.isArray(newData) || newData.length === 0) {
      console.log("❌ No new data provided for merge");
      return NextResponse.json({
        SUCCESS: false,
        MESSAGE: "No new data provided for merge operation"
      }, { status: 400 });
    }

    console.log(`📊 Received ${newData.length} new records for merge`);

    // Path to the websites CSV file
    const websitesCsvPath = path.resolve(ProjectRoot(), "data", "websites.csv");
    console.log(`📁 Target CSV file: ${websitesCsvPath}`);

    // Read existing data
    let existingData: CsvRowDataType[] = [];
    
    if (await fs.pathExists(websitesCsvPath)) {
      console.log("📖 Reading existing CSV data...");
      const fileContent = await fs.readFile(websitesCsvPath, 'utf-8');
      
      if (fileContent.trim()) {
        existingData = parse(fileContent, {
          columns: true,
          delimiter: ",",
          skip_empty_lines: true,
          trim: true,
        }) as CsvRowDataType[];
        
        console.log(`📈 Found ${existingData.length} existing records`);
      }
    } else {
      console.log("📝 No existing CSV file found, creating new one");
      // Ensure the data directory exists
      await fs.ensureDir(path.dirname(websitesCsvPath));
    }

    // Create a map of existing domains for duplicate checking
    const existingDomains = new Set(existingData.map(record => record.domain.toLowerCase()));
    
    // Filter out duplicates from new data
    const uniqueNewData = newData.filter(record => {
      const isDuplicate = existingDomains.has(record.domain.toLowerCase());
      if (isDuplicate) {
        console.log(`⚠️ Skipping duplicate domain: ${record.domain}`);
      }
      return !isDuplicate;
    });

    console.log(`✨ Adding ${uniqueNewData.length} unique records (${newData.length - uniqueNewData.length} duplicates skipped)`);

    // Merge data
    const mergedData = [...existingData, ...uniqueNewData];

    // Convert to CSV format
    const csvContent = stringify(mergedData, {
      header: true,
      columns: [
        'domain',
        'name', 
        'service_name',
        'address',
        'phone',
        'email',
        'site_title',
        'meta_title',
        'meta_description',
        'logo_url'
      ]
    });

    // Write merged data to CSV file
    await fs.writeFile(websitesCsvPath, csvContent, 'utf-8');
    
    console.log(`✅ Successfully merged data to ${websitesCsvPath}`);
    console.log(`📊 Total records: ${mergedData.length} (${existingData.length} existing + ${uniqueNewData.length} new)`);

    return NextResponse.json({
      SUCCESS: true,
      MESSAGE: `Successfully merged ${uniqueNewData.length} new records with ${existingData.length} existing records`,
      DATA: {
        totalRecords: mergedData.length,
        newRecords: uniqueNewData.length,
        existingRecords: existingData.length
      }
    }, { status: 200 });

  } catch (error) {
    console.error("💥 CSV Merge Error:", error);
    
    let errorMessage = "Failed to merge CSV data";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({
      SUCCESS: false,
      MESSAGE: errorMessage
    }, { status: 500 });
  }
}