import fs from "fs-extra";
import seedrandom from "seedrandom";
import sharp from "sharp";
import path from "path";
import { CsvAddressType, CsvRowDataType, EventResType } from "@repo/shared-types";
import { LogBuilder } from "@repo/log-helper";

type Choice = { value: string; weight: number };

export async function spintaxAndTokenHandler({
  csvData,
  inputPath,
  outputPath,
}: {
  csvData: CsvRowDataType;
  inputPath: string;
  outputPath: string;
}): Promise<EventResType> {
  const startTime = Date.now();
  const fileName = path.basename(inputPath);
  
  LogBuilder({
    domain: csvData.domain,
    logMessage: `Starting spintax and token processing for ${fileName}`,
    logType: "debug",
    context: { 
      function: "spintaxAndTokenHandler",
      inputPath,
      outputPath,
      fileName
    },
    logFileName: "astro-generator",
  });
  
  try {
    // Read the file content
    LogBuilder({
      domain: csvData.domain,
      logMessage: `Reading file content: ${fileName}`,
      logType: "silly",
      context: { function: "spintaxAndTokenHandler", step: "file-read" },
      logFileName: "astro-generator",
    });
    
    const fileContent = await fs.readFile(inputPath, "utf-8");
    const originalSize = fileContent.length;
    
    LogBuilder({
      domain: csvData.domain,
      logMessage: `File content read successfully`,
      logType: "silly",
      context: { 
        function: "spintaxAndTokenHandler",
        step: "file-read-complete",
        originalSizeBytes: originalSize,
        originalSizeKB: `${(originalSize / 1024).toFixed(2)}KB`
      },
      logFileName: "astro-generator",
    });

    // Parse spintax in the file content
    LogBuilder({
      domain: csvData.domain,
      logMessage: `Processing spintax variations`,
      logType: "debug",
      context: { function: "spintaxAndTokenHandler", step: "spintax-processing" },
      logFileName: "astro-generator",
    });
    
    const contentAfterSpintax = parseSpintax({
      fileContent,
      csvData: csvData,
      inputPath,
      outputPath,
    });

    // parse tokens in the file content
    LogBuilder({
      domain: csvData.domain,
      logMessage: `Processing token replacements`,
      logType: "debug",
      context: { function: "spintaxAndTokenHandler", step: "token-processing" },
      logFileName: "astro-generator",
    });
    
    const contentAfterTokens = parseTokens({
      fileContent: contentAfterSpintax,
      inputPath,
      csvData,
    });

    // process content for image handeling
    LogBuilder({
      domain: csvData.domain,
      logMessage: `Processing image optimizations`,
      logType: "debug",
      context: { function: "spintaxAndTokenHandler", step: "image-processing" },
      logFileName: "astro-generator",
    });
    
    const contentAfterImageProcess = imageProcessor({
      fileContent: contentAfterTokens,
      domain: csvData.domain,
      inputPath,
      outputPath,
    });
    
    const processedSize = contentAfterImageProcess.length;
    const processingTime = Date.now() - startTime;

    // Write the parsed content into the destination file
    LogBuilder({
      domain: csvData.domain,
      logMessage: `Writing processed content to destination`,
      logType: "silly",
      context: { 
        function: "spintaxAndTokenHandler",
        step: "file-write",
        processedSizeBytes: processedSize,
        processedSizeKB: `${(processedSize / 1024).toFixed(2)}KB`
      },
      logFileName: "astro-generator",
    });
    
    await fs.writeFile(outputPath, contentAfterImageProcess, "utf-8");
    
    LogBuilder({
      domain: csvData.domain,
      logMessage: `Spintax and token processing completed successfully for ${fileName}`,
      logType: "info",
      context: { 
        function: "spintaxAndTokenHandler",
        step: "completion-success",
        performance: {
          processingTimeMs: processingTime,
          processingTimeSec: `${(processingTime / 1000).toFixed(2)}s`,
          sizeChange: processedSize - originalSize,
          sizeChangePercent: originalSize > 0 ? `${((processedSize - originalSize) / originalSize * 100).toFixed(2)}%` : "0%"
        }
      },
      logFileName: "astro-generator",
    });
    
    return {
      SUCCESS: true,
      MESSAGE: `Spintax and token processing complete for ${outputPath}`,
    };
  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    
    console.error(`Error processing spintax for file: ${inputPath}`, error);
    
    LogBuilder({
      domain: csvData.domain,
      logMessage: `Spintax processing failed for ${fileName}`,
      logType: "error",
      context: { 
        function: "spintaxAndTokenHandler",
        step: "processing-failed",
        performance: {
          failedAfterMs: processingTime,
          failedAfterSec: `${(processingTime / 1000).toFixed(2)}s`
        }
      },
      error: error instanceof Error ? error : undefined,
      logFileName: "astro-generator",
    });
    
    return {
      SUCCESS: false,
      MESSAGE: `Error processing spintax for file: ${inputPath}: ${error?.message || error}`,
    };
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

  // store imported image list
  const importedImageListRegex =
    /import\s+\w+\s+from\s+["']\.\/[^"']*\.(jpg|jpeg|png|gif|webp)["'];?\s*\n?/gi;
  let importedImageListUnfiltered = [
    ...fileContent.matchAll(importedImageListRegex),
  ];

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

  // ✅ collect all updated imports first
  const allImports = importedImageList
    .map((importText) => {
      // handler image optimization and conversion
      imageOptimizationAndConversion({
        importStatement: importText,
        inputPath,
        outputPath,
      });

      const imgExt = path.extname(importText);
      return importText.replace(imgExt, '.webp"');
    })
    .join("\n");

  // replace placeholder once
  let updatedFileContent = fileContentWithoutImageImports.replace(
    rmImportPlaceholder,
    `${allImports}\n\n`
  );

  // remove unnecessary placeholder text
  updatedFileContent = updatedFileContent.replaceAll(rmImportPlaceholder, "");

  return updatedFileContent;
}

// handle image optimization and conversion
async function imageOptimizationAndConversion({
  importStatement,
  inputPath,
  outputPath,
}: {
  importStatement: string;
  inputPath: string;
  outputPath: string;
}) {
  // get only file path
  const imgPathInfo = importStatement.match(
    /from\s+["'](.+?)["']/
  ) as RegExpMatchArray;

  const inputFileDir = path.dirname(inputPath);
  const outputFileDir = path.dirname(outputPath);
  const inputImagePath = path.resolve(inputFileDir, imgPathInfo[1]);
  let outputImagePath = path.resolve(outputFileDir, imgPathInfo[1]);

  // image extension name
  const imgExt = path.extname(inputImagePath);
  outputImagePath = outputImagePath.replace(imgExt, ".webp");

  await sharp(inputImagePath)
    .resize({ width: 1000 })
    .webp({ quality: 80 })
    .toFile(outputImagePath);

  console.log("input image path ", inputImagePath);
  console.log("output image path ", outputImagePath);
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
        if (token === 'address') {
          const { street, city, state, country } : CsvAddressType = JSON.parse(csvData[token as keyof CsvRowDataType]);
          return `${street}, ${city}, ${state}, ${country}`;
        } else if (token === 'logo_url') {
          return `/logo/${csvData[token as keyof CsvRowDataType]}`; 
        } else {
          return csvData[token as keyof CsvRowDataType]; 
        }
      } else {
        console.warn(
          `Token ${token} not found in CSV data for file => ${inputPath}`
        );
        return match; // Leave the token as is if not found
      }
    }
  );
}
