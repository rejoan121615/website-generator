import fs from 'fs-extra';
import path from 'path';
import { astroProjectBuilder } from './astroHandler.js';


export function folderCreator(outputDir: string, domain: string) {
    if (!domain && !outputDir) {
        console.warn('Skipping creation of directory with missing domain');
        return;
    }
  // create folder inside build-output folder with domain name
  try {
    fs.ensureDirSync(path.join(outputDir, domain));
    console.log(`----------------------------------------------`);
    console.log(`Folder Created for : ${domain}`);
  } catch (err) {
    console.error(`Failed to create folder for domain "${domain}":`, err);
  }
}



