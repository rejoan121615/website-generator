import path from "path";
import fs from "fs-extra";
import { parse } from "csv-parse";
import { getRootDir } from "../utilities/path-solver.js";
import { CsvRowDataType } from "@repo/shared-types";
import { execa } from "execa";
import { astroProjectCreator } from "../modules/app-builder.js";

async function printName() {
  // Get command line arguments (skip first 2: node and script path)
  console.log("Starting single-page-generator...");
  const args = process.argv.slice(2);
  const hasDomainFlag = args.find((arg) => arg.trim() === "--domain");
  const hasDomain = args[1];

  if (!hasDomainFlag) {
    console.log(
      "The --domain flag is required. Ex: pnpm run single --domain domain.com"
    );
    return;
  } else if (!hasDomain) {
    console.log(
      "Please provide a domain after the --domain flag. Ex: pnpm run single --domain domain.com"
    );
    return;
  }

  try {
    //   read csv file from data/websites.csv
    const turboRepoRoot = getRootDir("../../../../");
    const csvFilePath = path.join(turboRepoRoot, "data", "websites.csv");

    const csvBuffer = fs.createReadStream(csvFilePath, "utf-8");
    let targetedRow: CsvRowDataType | undefined;

    const csvParser = csvBuffer.pipe(
      parse({
        delimiter: ",",
        columns: true,
        trim: true,
      })
    );

    csvParser.on("data", (row: CsvRowDataType) => {
      if (row.domain === hasDomain) {
        targetedRow = row;
      }
    });

    csvParser.on("end", () => {
      console.log("CSV file successfully processed.");
      if (targetedRow) {
        // if data found then started generating website
        astroProjectCreator(targetedRow)
          .then( async (res) => {
            if (res.SUCCESS) {
              console.log(
                `Successfully completed processing for domain: ${targetedRow?.domain}`
              );

              //  execute node_module installation and build
              const projectDir = path.resolve(
                turboRepoRoot,
                "apps",
                targetedRow?.domain!
              );
              try {
                  await execa("pnpm", ["install"], { 
                    cwd: projectDir,
                    stdio: "inherit" // This will print native output directly
                  });
                  
                  await execa("pnpm", ["run", "build"], { 
                    cwd: projectDir,
                    stdio: "inherit" // This will print native output directly
                  });
                
              } catch (error) {
                console.error("Error during pnpm install and build:", error);
              }
            }
          })
          .catch((err) => {
            console.error(
              `Error processing domain ${targetedRow?.domain}:`,
              err
            );
          });
      } else {
        console.log(`Domain ${hasDomain} not found in the CSV file.`);
      }
    });

    csvParser.on("error", (error) => {
      console.error("Error while processing CSV file:", error);
    });
  } catch (error) {}
}

// Execute the function
printName();
