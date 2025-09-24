import fs from 'fs-extra';
import path from 'path';
import { getRootDir } from '../utilities/path-solver.js';


export async function folderCreator( data : {domain: string}) {

  const { domain } = data;

  const outputDir = path.join(getRootDir('../../../../'), 'apps');

    if (!domain && !outputDir) {
        console.warn('Skipping creation of directory with missing domain');
        return;
    }
  // create folder inside build-output folder with domain name
  try {
    await fs.ensureDir(path.join(outputDir, domain));
    console.log(`----------------------------------------------`);
    console.log(`Folder Created for : ${domain}`);
  } catch (err) {
    console.log(`Failed to create folder for domain "${domain}":`, err);
    process.exit(1); 
  }
}



