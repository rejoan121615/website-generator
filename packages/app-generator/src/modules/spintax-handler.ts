import fs from "fs-extra";
import path from "path";
import seedrandom from "seedrandom";


type Choice = { value: string; weight: number };

// Function to parse spintax strings with optional weights and nested support
function parseSpintax({ domain, fileContent, depth = 0, inputPath }: { domain: string; fileContent: string; depth?: number; inputPath: string }): string {
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

export async function spintaxHandler({
  domain,
  inputPath,
  outputPath,
}: {
  domain: string;
  inputPath: string;
  outputPath: string;
}): Promise<void> {
  try {
    // Read the file content
    const fileContent = await fs.readFile(inputPath, "utf-8");

    // Parse spintax in the file content
    const parsedContent = parseSpintax({ fileContent, domain, inputPath});

    // Write the parsed content into the destination file
    await fs.writeFile(outputPath, parsedContent, "utf-8");

    console.log(`Spintax resolved and written for file: ${inputPath}`);
  } catch (error) {
    console.error(`Error processing spintax for file: ${inputPath}`, error);
  }
}
