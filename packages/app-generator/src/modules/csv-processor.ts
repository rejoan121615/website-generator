import { CsvRowDataType, CsvHeaderKey } from "@repo/shared-types";
import { CsvError, parse } from "csv-parse";
import fs from "fs-extra";
import { CsvProcessorResultType } from "../types/DataType.js";

export async function CsvProcessor({
  csvPath,
}: {
  csvPath: string;
}): Promise<CsvProcessorResultType> {
  return new Promise<CsvProcessorResultType>(async (resolve) => {
    try {
      // Read the first line to validate headers
      const fileContent = await fs.readFile(csvPath, "utf-8");
      const firstLine = fileContent.split("\n")[0].trim();
      const actualHeaders = firstLine
        .split(",")
        .map((h) => h.trim().replace(/^["']|["']$/g, ""));

      // Define required headers based on CsvRowDataType

      // Validate headers
      const missingHeaders = CsvHeaderKey.filter(
        (h) => !actualHeaders.includes(h)
      );
      const extraHeaders = actualHeaders.filter(
        (h) => !CsvHeaderKey.includes(h as keyof CsvRowDataType)
      );

      if (missingHeaders.length > 0 || extraHeaders.length > 0) {
        let errorMessage = `Error on CSV file header, Please follow => "template","domain","name","service_name","address","phone","email","site_title","meta_title","meta_description","logo_url",`;

        resolve({
          MESSAGE: errorMessage,
          SUCCESS: false,
          DATA: null,
        });
        return;
      }

      // Proceed with CSV parsing
      const csvStream = fs.createReadStream(csvPath, "utf-8");
      const csvDataList: CsvRowDataType[] = [];

      const parser = csvStream.pipe(
        parse({
          delimiter: ",",
          columns: true,
          trim: true,
          skip_empty_lines: true,
          encoding: "utf-8",
        })
      );

      parser.on("data", (row) => {
        for (const [key, value] of Object.entries(row)) {
          if (value === "" || value === null || value === undefined) {
            resolve({
              MESSAGE: "Check csv file, csv data is invalid",
              SUCCESS: false,
              DATA: null,
            });
            return;
          }
        }
        csvDataList.push(row);
      });

      parser.on("error", (error) => {
        const errType = error instanceof CsvError ? error : null;
        resolve({
          MESSAGE: errType?.message ?? "Check csv file, csv data is invalid",
          SUCCESS: false,
          DATA: null,
        });
      });

      parser.on("end", () => {
        resolve({
          SUCCESS: true,
          MESSAGE: "CSV processing completed successfully!",
          DATA: csvDataList,
        });
      });
    } catch (error) {
      resolve({
        MESSAGE: `Error reading CSV file: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        SUCCESS: false,
        DATA: null,
      });
    }
  });
}
