import fs from "fs-extra";
import path from "path";
import { parse } from "csv-parse";
import {
  ReadyToBuildResTYPE,
  CsvRowDataType,
  WebsitesResTYPE,
  WebsiteRowTYPE,
  GetApiResTYPE,
} from "@/types/websiteApi.type";
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

export async function GetReadyToBuildList({
  csvRowData,
}: {
  csvRowData: CsvRowDataType[];
}): Promise<GetApiResTYPE> {
  const appsFolderPath = path.resolve(ProjectRoot(), "apps");

  try {
    fs.ensureDirSync(appsFolderPath);

    let websiteList = await fs.readdir(appsFolderPath, {
      withFileTypes: false,
      encoding: "utf-8",
    });

    // Filter websiteList to include only folders that contain all required subfolders
    const requiredFolders = [
      "dist",
      "cloudflare",
      "src",
      "node_modules",
      "public",
    ];
    const filteredWebsiteList = websiteList.filter((folderName) => {
      const folderPath = path.join(appsFolderPath, folderName);
      // Check if all required subfolders exist inside the folder
      return requiredFolders.every((subFolder) =>
        fs.existsSync(path.join(folderPath, subFolder))
      );
    });

    websiteList = filteredWebsiteList;

    const WebsiteRowData: WebsiteRowTYPE[] = csvRowData.map((csvItem) => {
      const { domain } = csvItem;

      const buildStatus = websiteList.find((item) => item === domain);

      return {
        ...csvItem,
        build: buildStatus === undefined ? "unavailable" : "complete",
        deployed: "unavailable",
        log: "---",
      };
    });


    // deploy checker 
    const finalWebsiteList = await DeployDataUpdater({ WebsiteList: WebsiteRowData });

    return {
      SUCCESS: true,
      MESSAGE:
        finalWebsiteList.length > 0
          ? "Website list found successfully"
          : "No websites found",
      DATA: finalWebsiteList,
    };
  } catch (error) {
    console.error("Error building website list:", error);
    return {
      SUCCESS: false,
      MESSAGE: "Error finding website list",
    };
  }
}

export async function DeployDataUpdater({
  WebsiteList,
}: {
  WebsiteList: WebsiteRowTYPE[];
}): Promise<WebsiteRowTYPE[]> {
  const reportFolderPath = path.resolve(ProjectRoot(), "reports");

  const updatedList = WebsiteList.map((siteData) => {
    const { deployed, domain } = siteData;

    // check if the folder is available and have a file end with 'deploy.csv'
    const reportDir = path.resolve(reportFolderPath, domain, "deploy");
    const isDeployed =
      fs.existsSync(reportDir) &&
      fs
        .readFileSync(path.resolve(reportDir, `latest-deploy.csv`), "utf-8")
        .includes("Live-Url");

    return {
      ...siteData,
      deployed: isDeployed ? "complete" : deployed,
    };
  });

  return updatedList;
}
