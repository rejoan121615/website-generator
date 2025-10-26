import { CsvRowDataType } from "@repo/shared-types";
import { CsvError, parse } from "csv-parse";
import fs from "fs-extra";
import { CsvProcessorResultType } from "../types/DataType.js";

export async function CsvProcessor({
  csvPath,
}: {
  csvPath: string;
}): Promise<CsvProcessorResultType> {
  return new Promise<CsvProcessorResultType>((resolve) => {
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
  });
}
