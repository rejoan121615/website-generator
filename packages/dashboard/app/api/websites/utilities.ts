import fs from "fs-extra";
import path from "path";
import { parse } from "csv-parse";
import { ReadyToBuildResTYPE, CsvRowDataType, WebsitesResTYPE } from "@/types/websiteApi.type";
import { ProjectRoot } from "@/lib/assists";

export async function GetWebsiteCsvData(): Promise<WebsitesResTYPE> {
  const websitesCsvPath = path.resolve(ProjectRoot(), "data", "websites.csv");

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
        MESSAGE:
          "CSV processing fail, Please check the file format and content",
      });
    });
  });
}

export async function GetReadyToBuildList(): Promise<ReadyToBuildResTYPE> {
  const appsFolderPath = path.resolve(ProjectRoot(), "apps");

  try {

    fs.ensureDirSync(appsFolderPath);

    const websiteList = await fs.readdir(appsFolderPath, {
      withFileTypes: false,
      encoding: "utf-8",
    });
    
    return {
      SUCCESS: true,
      MESSAGE: websiteList.length > 0 ? "Website list found successfully" : "No websites found",
      DATA: websiteList,
    };
  } catch (error) {
    console.error("Error building website list:", error);
    return {
      SUCCESS: false,
      MESSAGE: "Error finding website list",
    }
  }
}
