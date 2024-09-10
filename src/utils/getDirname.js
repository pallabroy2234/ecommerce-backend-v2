import path from "path";
import { fileURLToPath } from "node:url";
export const getDirname = (metaUrl) => {
    const __filename = fileURLToPath(metaUrl);
    return path.dirname(__filename);
};
