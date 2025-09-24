import { PageOptionsTYPE } from "../types/AstroHandler.js";

// Example usage in your generator script
export async function pageContentsCreator(
  pageContent: string,
  pageData: PageOptionsTYPE
): Promise<string> {
  const { components, imports } = pageData;

  // update imports
  const importSectionRegex = /^---\s*([\s\S]*?)^---/m;
  const newImportSection = `---\n${imports.join("\n")}\n---`;
  pageContent = pageContent.replace(importSectionRegex, newImportSection);

  // update page content components
  const componentSectionRegex =
    /<!-- --- GENERATE --- -->([\s\S]*?)<!-- --- GENERATE --- -->/m;
  const newComponentSection = components
    .map((component) => {
      const propsString = Object.entries(component.props)
        .map(([key, value]) => `${key}={\"${value}\"}`)
        .join(" ");
      return `<${component.name} ${propsString} />`;
    })
    .join("\n");
  pageContent = pageContent.replace(componentSectionRegex, newComponentSection);

  return pageContent;
}