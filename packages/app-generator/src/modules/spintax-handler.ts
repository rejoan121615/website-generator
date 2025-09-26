import fs from "fs-extra";
import seedrandom from "seedrandom";
import { CsvRowDataType } from "../types/DataType.js";


type Choice = { value: string; weight: number };

// Function to parse spintax strings with optional weights and nested support
function parseSpintax ({ domain, fileContent, depth = 0, inputPath }: { domain: string; fileContent: string; depth?: number; inputPath: string }): string {
  if (depth > 3) {
    throw new Error("Maximum spintax nesting depth exceeded");
  }

  const spintaxRegex = /\[\[([^\[\]]*?)\]\]/g;

  // Initialize the seeded random number generator
  const rng = seedrandom(domain);

  return fileContent.replace(spintaxRegex, (match: string, options: string): string => {
    const choices: Choice[] = options.split("|").map((choice: string) => {
      const [value, weight] = choice.split("~");
      return { value, weight: parseFloat(weight) || 1 }; // Default weight is 1
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

    console.log(`Domain => ${domain} InputPath => ${inputPath} RNG Value => ${rngValue} `);

    let random = rngValue * totalWeight; // Use the seeded RNG instead of Math.random()


    for (const choice of choices) {
      if (random < choice.weight) {
        // Recursively resolve nested spintax
        return parseSpintax({ domain, fileContent: choice.value, depth: depth + 1 , inputPath });
      }
      random -= choice.weight;
    }

    return parseSpintax({ domain, fileContent: choices[0].value, inputPath }); // Fallback to the first choice
  });
}

// Function to parse token strings
function parseTokens ({ csvData, fileContent, inputPath }: { csvData: CsvRowDataType; fileContent: string; inputPath: string }) : string {
  const tokenRegex = /\{\{(.*?)\}\}/g;

  return fileContent.replace(tokenRegex, (match: string, token: string): string => {
    if (token in csvData) {
      return csvData[token as keyof CsvRowDataType]; // Replace token with corresponding CSV data
    } else {
      console.warn(`Token ${token} not found in CSV data for file => ${inputPath}`);
      return match; // Leave the token as is if not found
    }
  });
}

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
    const contentAfterSpintax = parseSpintax({ fileContent, domain: csvData.domain, inputPath});

    // parse tokens in the file content 
    const contentAfterTokens = parseTokens({ fileContent: contentAfterSpintax, inputPath, csvData });
     

    // Write the parsed content into the destination file
    await fs.writeFile(outputPath, contentAfterTokens, "utf-8");

    console.log(`Spintax resolved and written for file: ${inputPath}`);
  } catch (error) {
    console.error(`Error processing spintax for file: ${inputPath}`, error);
  }
}
