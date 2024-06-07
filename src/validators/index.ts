import {Request, Response, NextFunction} from "express";
import {validationResult} from "express-validator";

export const runValidation = (statusCode = 422) => {
	return (req: Request, res: Response, next: NextFunction) => {
		try {
			const errors = validationResult(req);
			if (!errors.isEmpty()) {
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
