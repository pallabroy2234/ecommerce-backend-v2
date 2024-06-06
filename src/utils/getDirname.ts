import path from "path";
import {fileURLToPath} from "node:url";

export const getDirname = (metaUrl: string) => {
	const __filename = fileURLToPath(metaUrl);
	return path.dirname(__filename);
};
