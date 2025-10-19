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
import { createReadStream } from "fs";
import { FetchProjects, GetProjectName } from '@repo/cf'

export async function FetchWebsites(): Promise<GetApiResTYPE> {
  const websitesCsvPath = path.resolve(ProjectRoot(), "data", "websites.csv");

  if (!fs.existsSync(websitesCsvPath)) {
    return {
      SUCCESS: false,
      MESSAGE: "Websites CSV file not found",
    };
  }

  return new Promise<GetApiResTYPE>((resolve, reject) => {
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

    csvParser.on("end", async () => {
      try {
        const { SUCCESS, MESSAGE, DATA } = await GetReadyToBuildList({
          csvRowData: websitesData,
        });
        if (!SUCCESS) {
          return reject({
            SUCCESS: false,
            MESSAGE,
          });
        }

        resolve({
          SUCCESS: true,
          MESSAGE: MESSAGE || "Websites CSV data processed successfully",
          DATA: DATA,
        });
      } catch (error) {
        console.error("Error getting ready to build list:", error);
        reject({
          SUCCESS: false,
          MESSAGE: "Error processing websites data",
        });
      }
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
        liveUrl: null,
      };
    });

    // deploy checker
    const finalWebsiteList = await DeployDataUpdater({
      WebsiteList: WebsiteRowData,
    });

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

  const projectData = await FetchProjects();

  if (projectData.SUCCESS && projectData.DATA) {
    const projectNameList = projectData.DATA.map(proj => proj.name);
    
   return  WebsiteList.map((site) => {
      const { projectName } = GetProjectName(site.domain);
      if (projectNameList.includes(projectName)) {
        site.deployed = "complete";
      }
      return site;
    });
  }
  
  return WebsiteList;


  // console.log('fetch project data ', projectData)

  // const reportFolderPath = path.resolve(ProjectRoot(), "reports");

  // const updatedList = await Promise.all(
  //   WebsiteList.map(async (siteData) => {
  //     const { domain } = siteData;
  //     const updatedSiteData = { ...siteData };
  //     const reportDir = path.resolve(reportFolderPath, domain, "deploy");
  //     const csvFilePath = path.resolve(reportDir, `latest-deploy.csv`);

  //     if (fs.existsSync(csvFilePath)) {
  //       // Read the CSV file and parse rows
  //       const csvRows: any[] = [];
  //       await new Promise<void>((resolve, reject) => {
  //         const csvStream = createReadStream(csvFilePath, "utf-8");
  //         const csvParse = csvStream.pipe(
  //           parse({
  //             columns: true,
  //             delimiter: ",",
  //           })
  //         );
  //         csvParse.on("data", (row: any) => {
  //           csvRows.push(row);
  //         });
  //         csvParse.on("end", () => {
  //           resolve();
  //         });
  //         csvParse.on("error", (err) => {
  //           reject(err);
  //         });
  //       });
  //       // Find the first row with a liveUrl (case-insensitive column)
  //       const liveUrlRow = csvRows.find(
  //         (row) => row["liveUrl"] || row["Live-Url"] || row["LiveUrl"]
  //       );
  //       const foundUrl =
  //         (liveUrlRow && (liveUrlRow["liveUrl"] || liveUrlRow["Live-Url"] || liveUrlRow["LiveUrl"])) || null;
  //       if (foundUrl) {
  //         updatedSiteData.liveUrl = foundUrl;
  //         updatedSiteData.deployed = "complete";
  //       }
  //     }
  //     return updatedSiteData;
  //   })
  // );
  // return updatedList;
}
