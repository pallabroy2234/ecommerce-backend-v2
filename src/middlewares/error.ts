import {NextFunction, Request, Response} from "express";
import logger from "../utils/logger.js";
import ErrorHandler from "../utils/utility-class.js";
import {ControllerType} from "../types/types.js";
import multer from "multer";
import {stripe} from "../app.js";

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

	// Handle Stripe-specific errors
	// if (err instanceof stripe.errors.StripeError) {
	// 	let statusCode = 500;
	// 	let message = "An error occurred while processing the payment.";
	//
	// 	// Customize messages based on specific Stripe error types
	// 	switch (err.type) {
	// 		case "StripeCardError":
	// 			// A declined card error
	// 			message = `Payment failed: ${err.message}`;
	// 			statusCode = 402; // Payment Required
	// 			break;
	// 		case "StripeInvalidRequestError":
	// 			// Invalid parameters were supplied to Stripe's API
	// 			message = `Invalid request: ${err.message}`;
	// 			statusCode = 400; // Bad Request
	// 			break;
	// 		case "StripeAPIError":
	// 			// An error occurred internally with Stripe's API
	// 			message = "An internal error occurred with the payment provider. Please try again later.";
	// 			statusCode = 500; // Internal Server Error
	// 			break;
	// 		case "StripeConnectionError":
	// 			// Some kind of error occurred during the HTTPS communication
	// 			message =
	// 				"Network communication with the payment provider failed. Please check your internet connection.";
	// 			statusCode = 502; // Bad Gateway
	// 			break;
	// 		case "StripeRateLimitError":
	// 			// Too many requests hit the API too quickly
	// 			message = "Too many requests. Please try again later.";
	// 			statusCode = 429; // Too Many Requests
	// 			break;
	// 		default:
	// 			// Handle other generic Stripe errors
	// 			message = `Payment processing error: ${err.message}`;
	// 			statusCode = 500; // Internal Server Error
	// 			break;
	// 	}
	//
	// 	logger.error(message);
	// 	return res.status(statusCode).json({
	// 		success: false,
	// 		message,
	// 	});
	// }

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
