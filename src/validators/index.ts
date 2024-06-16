import {Request, Response, NextFunction} from "express";
import {validationResult} from "express-validator";
import {unlinkSync} from "fs";
import logger from "../utils/logger.js";

export const runValidation = (statusCode = 422) => {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
				// * If there are errors, delete the image from the request
				const image = req.file;
				if (image) {
					deleteImage(image.path);
				}
				return res.status(statusCode).json({
					success: false,
					message: errors.array()[0].msg,
				});
			}
			return next(); // Move next() call outside if statement to ensure it's called even if there are no errors
		} catch (error) {
			next(error);
		}
	};
};

// * Delete image function to be used in the runValidation middleware
const deleteImage = (path: string) => {
	try {
		unlinkSync(path);
		logger.info(`Image deleted: ${path}`);
	} catch (error) {
		logger.error(`Error deleting image: ${error}`);
	}
};
