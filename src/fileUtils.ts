import fs from 'fs'

export function isFolderWritable(dirPath: string) : boolean {
	try {
		fs.accessSync(dirPath, fs.constants.W_OK);
		return true;
	} catch (ex: any) {}
	
	return false;
}