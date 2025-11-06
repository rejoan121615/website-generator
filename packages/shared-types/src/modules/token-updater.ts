import fsExtra from 'fs-extra';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const { readFileSync, writeFileSync } = fsExtra;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CSV_FILE_PATH = resolve(__dirname, '../../../../data/websites.csv');
const CSV_TYPES_FILE_PATH = resolve(__dirname, '../../src/types/csv.ts');

async function updateCsvTypes() {
  try {
    console.log('Reading CSV file...');
    
    // Read the CSV file
    const csvContent = readFileSync(CSV_FILE_PATH, 'utf-8');
    
    // Get the header (first line)
    const lines = csvContent.split('\n');
    const header = lines[0].trim();

    console.log('CSV Header row on websites.csv file:', header);

    // Parse header fields
    const fields = header.split(',').map((field: string) => field.trim());
        
    // Generate CsvRowDataType
    const typeFields = fields.map((field: string) => `  ${field}: string;`).join('\n');
    const csvRowDataType = `export type CsvRowDataType = {\n${typeFields}\n};`;
    
    // Generate CsvHeaderKey
    const headerKeys = fields.map((field: string) => `  "${field}"`).join(',\n');
    const csvHeaderKey = `export const CsvHeaderKey : (keyof CsvRowDataType)[] = [\n${headerKeys}\n];`;
    
    // Read the current csv.ts file
    console.log('Reading current csv.ts file...');
    const currentContent = readFileSync(CSV_TYPES_FILE_PATH, 'utf-8');
    
    // Replace CsvRowDataType
    let updatedContent = currentContent.replace(
      /export type CsvRowDataType = \{[^}]*\};/s,
      csvRowDataType
    );
    
    // Replace CsvHeaderKey
    updatedContent = updatedContent.replace(
      /export const CsvHeaderKey\s*:\s*\(keyof CsvRowDataType\)\[\]\s*=\s*\[[^\]]*\];/s,
      csvHeaderKey
    );
    
    // Write the updated content back
    console.log('Writing updated types to csv.ts...');
    writeFileSync(CSV_TYPES_FILE_PATH, updatedContent, 'utf-8');
    
    console.log('✅ Successfully updated CsvRowDataType and CsvHeaderKey!');    
  } catch (error) {
    console.error('❌ Error updating CSV types:', error);
    process.exit(1);
  }
}

// Run the script
updateCsvTypes();
