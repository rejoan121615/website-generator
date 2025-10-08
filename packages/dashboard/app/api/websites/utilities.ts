import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "csv-parse";
import { CsvRowDataType, WebsitesResTYPE } from "@/types/api.type";

export async function getAllWebsites(): Promise<WebsitesResTYPE> {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const websitesCsvPath = path.resolve(
    __dirname,
    "../../../../../data/websites.csv"
  );

  const websitesDir = path.resolve(__dirname, "../../../../../apps")

  if (!fs.existsSync(websitesCsvPath)) {
    return {
      SUCCESS: false,
      MESSAGE: "Websites CSV file not found",
    };
  }

  return new Promise<WebsitesResTYPE>((resolve, reject) => {
    const websitesData: CsvRowDataType[] = [];

    const csvStream = fs.createReadStream(websitesCsvPath, "utf-8");

    const csvParser = csvStream.pipe(
      parse({
        columns: true,
        delimiter: ",",
      })
    );

    csvParser.on("data", (row: any) => {
      websitesData.push(row as CsvRowDataType);
    });

    csvParser.on("end", () => {
      resolve({
        SUCCESS: true,
        MESSAGE: "Websites CSV file processed successfully",
        DATA: websitesData,
      });
    });

    csvParser.on("error", (err) => {
      reject({
        SUCCESS: false,
        MESSAGE: "CSV processing fail, Please check the file format and content",
      });
    });
  });
}
