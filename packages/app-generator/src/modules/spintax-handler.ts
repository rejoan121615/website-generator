import fs from "fs-extra";
import path from "path";

// Function to parse spintax strings with optional weights and nested support
function parseSpintax(input: string, depth: number = 0): string {
  if (depth > 3) {
    throw new Error("Maximum spintax nesting depth exceeded");
  }

  const spintaxRegex = /\[\[([^\[\]]*?)\]\]/g;

  return input.replace(spintaxRegex, (match, options) => {
    const choices = options.split("|").map((choice: string) => {
      const [value, weight] = choice.split("~");
      return { value, weight: parseFloat(weight) || 1 }; // Default weight is 1
    });

    const totalWeight = choices.reduce(
      (sum: number, choice: { value: string; weight: number }) =>
        sum + choice.weight,
      0
    );
    let random = Math.random() * totalWeight;

    for (const choice of choices) {
      if (random < choice.weight) {
        // Recursively resolve nested spintax
        return parseSpintax(choice.value, depth + 1);
      }
      random -= choice.weight;
    }

    return parseSpintax(choices[0].value, depth + 1); // Fallback to the first choice
  });
}

export async function spintaxHandler(inputPath: string, outputPath: string): Promise<void> {
  try {
    // Read the file content
    const fileContent = await fs.readFile(inputPath, "utf-8");

    // Parse spintax in the file content
    const parsedContent = parseSpintax(fileContent);

    // Write the parsed content into the destination file
    await fs.writeFile(outputPath, parsedContent, 'utf-8');

    console.log(`Spintax resolved and written for file: ${inputPath}`);
  } catch (error) {
    console.error(`Error processing spintax for file: ${inputPath}`, error);
  }
}
