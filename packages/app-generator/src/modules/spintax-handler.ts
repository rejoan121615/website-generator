import fs from "fs-extra";
import seedrandom from "seedrandom";
import { CsvRowDataType } from "../types/DataType.js";
import sharp from "sharp";

type Choice = { value: string; weight: number };

export async function spintaxAndTokenHandler({
  csvData,
  inputPath,
  outputPath,
}: {
  csvData: CsvRowDataType;
  inputPath: string;
  outputPath: string;
}): Promise<void> {
  try {
    // Read the file content
    const fileContent = await fs.readFile(inputPath, "utf-8");

    // Parse spintax in the file content
    const contentAfterSpintax = parseSpintax({
      fileContent,
      csvData: csvData,
      inputPath,
      outputPath,
    });

    // parse tokens in the file content
    const contentAfterTokens = parseTokens({
      fileContent: contentAfterSpintax,
      inputPath,
      csvData,
    });

    // process content for image handeling

    const contentAfterImageProcess = imageProcessor({
      fileContent: contentAfterTokens,
      domain: csvData.domain,
      inputPath,
      outputPath,
    });

    // Write the parsed content into the destination file
    await fs.writeFile(outputPath, contentAfterImageProcess, "utf-8");
  } catch (error) {
    console.error(`Error processing spintax for file: ${inputPath}`, error);
  }
}

// image processor to remove image imports and handle image optimization
function imageProcessor({
  fileContent,
  domain,
  inputPath,
  outputPath,
}: {
  fileContent: string;
  domain: string;
  inputPath: string;
  outputPath: string;
}): string {
  // Remove all image import statements
  // This regex matches: import variableName from "./path/to/image.jpg";

  if (inputPath.endsWith("Hero.astro")) {
    // store imported image list
    const importedImageListRegex =
      /import\s+\w+\s+from\s+["']\.\/[^"']*\.(jpg|jpeg|png|gif|webp)["'];?\s*\n?/gi;
    let importedImageListUnfiltered = [
      ...fileContent.matchAll(importedImageListRegex),
    ];
    console.log(
      "------------------------------------------------------------------------------------------------------"
    );
    let importedImageList = importedImageListUnfiltered.map((match) => {
      return match[0].trimEnd();
    });

    // replace all image import statements with //..... image import .....
    const rmImportPlaceholder = "//..... remove image import .....\n";
    const fileContentWithoutImageImports = fileContent.replace(
      importedImageListRegex,
      rmImportPlaceholder
    );

    // only keep that import which are used in the file content
    importedImageList = importedImageList
      .map((imageImportText) => {
        const match = imageImportText.match(/import\s+(\w+)\s+from/);
        if (match && fileContentWithoutImageImports.includes(match[1])) {
          return imageImportText;
        } else {
          return "";
        }
      })
      .filter((item) => item !== "");

    // replace file content with used import
    let updatedFileContent: string = "";
    importedImageList.forEach((importText) => {
      // handler image optimization and conversion 
      updatedFileContent = fileContentWithoutImageImports.replace( // replace import with placeholder text 
        rmImportPlaceholder,
        `${importText}\n\n`
      );
    });

    // remove unnecessary placeholder text
    updatedFileContent = updatedFileContent.replaceAll(rmImportPlaceholder, "");

    // Replace src: `something` with src: something (remove backticks)
    updatedFileContent = updatedFileContent.replace(
      /getImage\s*\(\s*\{([\s\S]*?)\}\s*\)/g,
      (match, inner) => {
        const newInner = inner.replace(/src:\s*`([^`]+)`/g, "src: $1");
        return `getImage({${newInner}})`;
      }
    );

    return updatedFileContent;
  } else {
    return fileContent;
  }
}

// Function to parse spintax strings with optional weights and nested support
function parseSpintax({
  csvData,
  fileContent,
  depth = 0,
  inputPath,
  outputPath,
}: {
  csvData: CsvRowDataType;
  fileContent: string;
  depth?: number;
  inputPath: string;
  outputPath: string;
}): string {
  const { domain } = csvData;

  if (depth > 5) {
    throw new Error("Maximum spintax nesting depth exceeded");
  }

  const spintaxRegex = /\[\[([^\[\]]*?)\]\]/g;

  // Initialize the seeded random number generator
  const rng = seedrandom(domain);

  let processedContent = fileContent;
  let previousContent = ""; // To check if content changed

  // Keep processing until no more spintax patterns are found or no changes occur
  while (processedContent !== previousContent) {
    previousContent = processedContent; // Store content before replacement

    processedContent = processedContent.replace(
      spintaxRegex,
      (match: string, options: string): string => {
        const choices: Choice[] = options.split("|").map((choice: string) => {
          const [value, weight] = choice.split("~");
          return { value, weight: parseFloat(weight) || 1 };
        });

        // Fallback for empty choices
        if (choices.length === 0) {
          return ""; // Return an empty string if no choices are available
        }

        const totalWeight = choices.reduce(
          (sum: number, choice: Choice) => sum + choice.weight,
          0
        );

        const rngValue = rng();

        let random = rngValue * totalWeight; // Use the seeded RNG instead of Math.random()

        for (const choice of choices) {
          if (random < choice.weight) {
            // Recursively resolve nested spintax
            return parseSpintax({
              csvData,
              fileContent: choice.value,
              depth: depth + 1,
              inputPath,
              outputPath,
            });
          }
          random -= choice.weight;
        }

        // Fallback to the first choice, also recursively parse it
        return parseSpintax({
          csvData,
          fileContent: choices[0].value,
          depth: depth + 1,
          inputPath,
          outputPath,
        });
      }
    );
  }

  return processedContent;
}

// Function to parse token strings
function parseTokens({
  csvData,
  fileContent,
  inputPath,
}: {
  csvData: CsvRowDataType;
  fileContent: string;
  inputPath: string;
}): string {
  const tokenRegex = /\{\{(.*?)\}\}/g;

  return fileContent.replace(
    tokenRegex,
    (match: string, token: string): string => {
      if (token in csvData) {
        return csvData[token as keyof CsvRowDataType]; // Replace token with corresponding CSV data
      } else {
        console.warn(
          `Token ${token} not found in CSV data for file => ${inputPath}`
        );
        return match; // Leave the token as is if not found
      }
    }
  );
}
