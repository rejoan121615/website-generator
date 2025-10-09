import dotenv from "dotenv";
import path from "path";
import fs from "fs-extra";
import { parse } from "csv-parse";
import type { CsvRowDataType } from "./types/DataType.js";
import { getRootDir } from "./utilities/path-solver.js";
import { astroProjectCreator } from "./modules/app-builder.js";

const turboRepoRoot = getRootDir("../../../../");

dotenv.config({ path: path.resolve(turboRepoRoot, ".env") });

const csvFilePath = path.join(turboRepoRoot, "data", "websites.csv");
const outputDir = path.join(turboRepoRoot, "apps");

// create output dir if not exists
fs.ensureDirSync(outputDir);

// check if the file exists
if (fs.existsSync(csvFilePath)) {
  // create readable stream
  const csvStream = fs.createReadStream(csvFilePath);
  // fs.removeSync(outputDir);

  const parser = csvStream.pipe(
    parse({
      columns: true, // use first row as header and generate objects
      delimiter: ",",
    })
  );

  parser.on("data", async (row: CsvRowDataType) => {
    astroProjectCreator(row);
  });

  parser.on("end", () => {
    console.log("CSV file successfully processed");
  });

  parser.on("error", (err) => {
    console.error("Error while processing CSV:", err);
  });
} else {
    console.error(`CSV file not found at path: ${csvFilePath}`);
    process.exit(1);
}
