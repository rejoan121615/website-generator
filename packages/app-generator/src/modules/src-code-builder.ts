import path from "path";
import fs from "fs-extra";
import { CsvRowDataType} from '../types/DataType.js'
import { pageContentsCreator } from "../utilities/page-interceptor.js";
import { getRootDir } from "../utilities/path-solver.js";


const turboRepoRoot = getRootDir('../../../../');


// src folder handler
export async function srcCodeBuilder(data: CsvRowDataType) {
    // this function will build src code  for now, let's just copy src code we will implement spintext later
    

}

// src folder handler
export async function appPageBuilder(data: CsvRowDataType) {
  const { domain, service_niche, main_city, phone } = data;

  // read component file from baseFrontend package and build new component file
  const componentFilePath = path.join(
    turboRepoRoot,
    "packages",
    "baseFrontend",
    "src",
    "components",
    "Content.astro"
  );

  const componentDestPath = path.join(
    turboRepoRoot,
    "apps",
    data.domain,
    "src",
    "components",
    "Content.astro"
  );

  // Ensure the destination directory exists
  await fs.ensureDir(path.dirname(componentDestPath));
  // Create the file if it doesn't exist
  await fs.ensureFile(componentDestPath);

  fs.copyFileSync(componentFilePath, componentDestPath);

  // read page file , give props and build new page file
  const pageFilePath = path.join(
    turboRepoRoot,
    "packages",
    "baseFrontend",
    "src",
    "pages",
    "index.astro"
  );
  const pageDestPath = path.join(
    turboRepoRoot,
    "apps",
    data.domain,
    "src",
    "pages",
    "index.astro"
  );

  let pageContent = await fs.readFile(pageFilePath, "utf-8");
  await fs.createFile(pageDestPath);

  const newPageContent = await pageContentsCreator(pageContent, {
    imports: [
      `import BaseLayout from '@repo/basefrontend/layout'`,
      `import Content from '@repo/basefrontend/content'`,
    ],
    components: [
      {
        name: "Content",
        props: {
          domain: domain,
          service_niche: service_niche,
          main_city: main_city,
          phone: phone,
        },
      },
    ],
  });

  await fs.writeFile(pageDestPath, newPageContent);
  console.log(" Astro app created successfully ... ");
}
