import { NextRequest, NextResponse } from "next/server";
import { parse } from "csv-parse/sync";
import fs from "fs-extra";
import path from "path";
import os from "os";
import { CsvRowDataType } from "@repo/shared-types";
import { CsvParseApiResponse } from "@/types/dashboard.type";

export async function POST(request: NextRequest): Promise<NextResponse<CsvParseApiResponse>> {
  let tempFilePath: string | null = null;
  
  try {
    console.log("📁 CSV Parse API - Starting file processing...");
    
    // Extract file from FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file || typeof file === 'string') {
      console.log("❌ No file provided in request");
      return NextResponse.json({
        SUCCESS: false,
        MESSAGE: "No file provided"
      }, { status: 400 });
    }

    console.log(`📄 Received file: ${file.name} (${file.size} bytes, ${file.type})`);

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      console.log("❌ Invalid file type:", file.type);
      return NextResponse.json({
        SUCCESS: false,
        MESSAGE: "Invalid file type. Please upload a CSV file."
      }, { status: 400 });
    }

    // Create temporary file using fs-extra
    const tempDir = os.tmpdir();
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    tempFilePath = path.join(tempDir, `csv-upload-${timestamp}-${randomId}.csv`);
    
    console.log(`Creating temporary file: ${tempFilePath}`);

    // Write uploaded file to temp location using fs-extra
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(tempFilePath as string, buffer);
    
    console.log("File written to temporary location");

    // Read file content using fs-extra
    const fileContent = await fs.readFile(tempFilePath as string, 'utf-8') as string;
    
    if (!fileContent.trim()) {
      console.log("CSV file is empty");
      return NextResponse.json({
        SUCCESS: false,
        MESSAGE: "CSV file is empty"
      }, { status: 400 });
    }

    // Define required headers in the exact order
    const requiredHeaders = [
      'template',
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
    ];

    // Extract and validate headers from the first line
    const firstLine = fileContent.split('\n')[0].trim();
    const actualHeaders = firstLine.split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));

    console.log("Required headers:", requiredHeaders);
    console.log("Actual headers:", actualHeaders);

    // Check if all required headers are present
    const missingHeaders = requiredHeaders.filter(h => !actualHeaders.includes(h));
    const extraHeaders = actualHeaders.filter(h => !requiredHeaders.includes(h));

    if (missingHeaders.length > 0 || extraHeaders.length > 0) {
      console.log("❌ Header validation failed");
      console.log("Missing headers:", missingHeaders);
      console.log("Extra headers:", extraHeaders);
      
      return NextResponse.json({
        SUCCESS: false,
        MESSAGE: "CSV file header doesn't match with websites.csv header."
      }, { status: 400 });
    }

    console.log("✅ CSV headers validated successfully");

    // Parse CSV using csv-parse
    const records = parse(fileContent, {
      columns: true,
      delimiter: ",",
      skip_empty_lines: true,
      trim: true,
      cast: true,
    }) as CsvRowDataType[];

    console.log(`Parsed ${records.length} records from CSV`);

    if (records.length === 0) {
      console.log("No valid data found after processing");
      return NextResponse.json({
        SUCCESS: false,
        MESSAGE: "No valid data found in CSV file"
      }, { status: 400 });
    }

    console.log(`Successfully processed ${records.length} records`);

    return NextResponse.json({
      SUCCESS: true,
      MESSAGE: `Successfully parsed ${records.length} records from CSV file`,
      DATA: records
    }, { status: 200 });

  } catch (error) {
    console.error("CSV Parse Error:", error);
    
    let errorMessage = "Failed to parse CSV file";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({
      SUCCESS: false,
      MESSAGE: errorMessage
    }, { status: 500 });
  } finally {
    // Cleanup temporary file using fs-extra
    if (tempFilePath) {
      try {
        await fs.remove(tempFilePath);
        console.log(`Cleaned up temporary file: ${tempFilePath}`);
      } catch (cleanupError) {
        console.warn("Failed to clean up temporary file:", cleanupError);
      }
    }
  }
}