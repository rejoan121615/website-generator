import path from 'path';
import fs from 'fs-extra';
import { parse } from 'csv-parse';
import { folderCreator } from './utilities/folderCreator.js';
import type { CsvRowDataType } from './types/DataType.js';
import { astroProjectBuilder } from './utilities/astroHandler.js';


const csvFilePath = path.join(process.cwd(), 'data', 'websites.csv');
const outputDir = path.join(process.cwd(), 'apps');

// create output dir if not exists
fs.ensureDirSync(outputDir);

// create readable stream
const csvStream = fs.createReadStream(csvFilePath);
// fs.removeSync(outputDir);

const parser = csvStream.pipe(parse({
    columns: true, // use first row as header and generate objects
    delimiter: ',',
}));

parser.on('data', async (row : CsvRowDataType ) => {
    const { domain } = row;
    // create folder 
    folderCreator(outputDir, domain);
    astroProjectBuilder(outputDir, row);
});


parser.on('end', () => {
    console.log('CSV file successfully processed');
});


parser.on('error', (err) => {
    console.error('Error while processing CSV:', err);
});