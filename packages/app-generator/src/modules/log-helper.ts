import { LogDataTYPE } from "../types/DataType.js";
import { getRootDir } from "../utilities/path-solver.js";



export async function handleLog({ timestamp, message, type, context }: LogDataTYPE) {
    
    const rootDir = getRootDir("../../../../");
    
    console.log(rootDir);
   
}