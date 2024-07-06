import {NextFunction, Request, Response} from "express";
import logger from "../utils/logger.js";
import ErrorHandler from "../utils/utility-class.js";
import {ControllerType} from "../types/types.js";
import multer from "multer";

// ! Error Middleware Function
// export const errorMiddleWare = (
// 	err: ErrorHandler,
// 	req: Request,
// 	res: Response,
// 	next: NextFunction,
// ) => {
// 	logger.error(err.message);
//
// 	// Handle Multer-specific errors
// 	if (err instanceof multer.MulterError) {
// 		if (err.code === "LIMIT_FILE_SIZE") {
// 			logger.error("File size should not exceed 2 MB");
// 			return res.status(400).json({
// 				success: false,
// 				message: "File size should not exceed 2 MB",
// 			});
// 		}
// 	}
//
// 	err.message = err.message || "Internal Server Error";
// 	err.statusCode = err.statusCode || 500;
//
// 	return res.status(err.statusCode).json({
// 		success: false,
// 		message: err.message,
// 	});
// };

export const errorMiddleWare = (
	err: ErrorHandler | multer.MulterError | Error,
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	logger.error(err.message);

	// Check if headers are already sent
	if (res.headersSent) {
		return next(err);
	}

	// Handle Multer-specific errors
	if (err instanceof multer.MulterError) {
		if (err.code === "LIMIT_FILE_SIZE") {
			logger.error("File size should not exceed 2 MB");
			return res.status(400).json({
				success: false,
				message: "File size should not exceed 2 MB",
			});
		}
		// You can handle other multer errors here
	}

	// Handle custom ErrorHandler
	if (err instanceof ErrorHandler) {
		return res.status(err.statusCode).json({
			success: false,
			message: err.message,
			// * Uncomment the line below to include the payload in the response
			// payload: err.payload,
		});
	}

	// Handle generic errors
	err.message = err.message || "Internal Server Error";
	const statusCode = (err instanceof ErrorHandler && err.statusCode) || 500;

	return res.status(statusCode).json({
		success: false,
		message: err.message,
	});
};

// ! Not Found Middleware Function
export const notFound = (req: Request, res: Response, next: NextFunction) => {
	const error = new ErrorHandler(`Not Found - ${req.originalUrl}`, 404);
	next(error);
};

// ! Try Catch Async Function

// export const TryCatch = (func: ControllerType) => {
// 	return (req: Request, res: Response, next: NextFunction) => {
// 		return Promise.resolve(func(req, res, next)).catch((err) => {
// 			next(err);
// 		});
// 	};
// };

// ! Try Catch Async Function
export const TryCatch = (controller: ControllerType) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			// Call the controller function and await its result
			await controller(req, res, next);
		} catch (error) {
			// Pass any errors to the next middleware
			next(error);
		}
	};
};
