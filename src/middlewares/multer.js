import multer from "multer";
import { extname, join } from "path";
import { mkdirSync, readdirSync, unlinkSync } from "fs";
import logger from "../utils/logger.js";
import { v4 as uuid } from "uuid";
import ErrorHandler from "../utils/utility-class.js";
import { existsSync } from "node:fs";
const ALLOWED_FILE_TYPES = ["jpg", "jpeg", "png"];
const PUBLIC = "public";
const UPLOAD_FOLDER = `${PUBLIC}/uploads`;
const MAX_FILE_SIZE = 1024 * 1024 * 2; // 2 MB
function ensureDirectoryExists(directory) {
    if (!existsSync(directory)) {
        try {
            mkdirSync(directory, { recursive: true });
            logger.info(`${directory} folder created successfully`);
        }
        catch (err) {
            logger.error(`Error creating ${directory} folder`, err);
            return new ErrorHandler(`Error creating ${directory} folder`, 500);
        }
    }
}
// Ensure that public and uploads folders exist
ensureDirectoryExists(PUBLIC);
ensureDirectoryExists(UPLOAD_FOLDER);
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOAD_FOLDER);
    },
    filename: function (req, file, cb) {
        // const extensionName = extname(file.originalname);
        // cb(null, Date.now() + "-" + file.originalname.replace(extensionName, "") + extensionName);
        const id = uuid();
        const extensionName = file.originalname.split(".").pop();
        const fileName = `${id}.${extensionName}`;
        cb(null, fileName);
    },
});
const fileFilter = (req, file, cb) => {
    const extensionName = extname(file.originalname);
    if (!ALLOWED_FILE_TYPES.includes(extensionName.substring(1))) {
        return cb(new ErrorHandler("Only images are allowed", 400));
    }
    // Uncomment and adjust the logic if you need to limit the number of files
    // if (req.files && req.files.length >= 3) {
    //     return cb(new Error("Only 3 images are allowed"));
    // }
    cb(null, true);
};
const unlinkAllFilesMiddleware = () => {
    const files = readdirSync(UPLOAD_FOLDER);
    files.forEach((file) => {
        const filePath = join(UPLOAD_FOLDER, file);
        try {
            unlinkSync(filePath);
            logger.info(`File ${filePath} deleted successfully`);
        }
        catch (unlinkError) {
            logger.error(`Error unlinking file ${filePath}:`, unlinkError);
        }
    });
};
export const singleUpload = multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE },
}).single("image");
