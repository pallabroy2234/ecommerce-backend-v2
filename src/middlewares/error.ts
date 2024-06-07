import {NextFunction, Request, Response} from "express";
import logger from "../utils/logger.js";
import ErrorHandler from "../utils/utility-class.js";

export const errorMiddleWare = (err: ErrorHandler, req: Request, res: Response, next: NextFunction) => {
	logger.error(err.message);
	err.message = err.message || "Internal Server Error";
	err.statusCode = err.statusCode || 500;
	return res.status(err.statusCode).json({
		success: false,
		message: err.message,
	});
};

export const notFound = (req: Request, res: Response, next: NextFunction) => {
	const error = new ErrorHandler(`Not Found - ${req.originalUrl}`, 404);
	next(error);
};
