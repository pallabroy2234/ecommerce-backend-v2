import ErrorHandler from "./utility-class.js";
import logger from "./logger.js";
import {Request, Response, NextFunction} from "express";

export const allowedField = (
	req: Request,
	res: Response,
	next: NextFunction,
	allowedFields: string[],
) => {
	const bodyKeys = Object.keys(req.body);
	const invalidFields = bodyKeys.filter(
		(key) => !allowedFields.includes(key),
	);

	if (invalidFields.length > 0) {
		logger.warn(`Invalid fields found: ${invalidFields.join(", ")}`);
		return next(
			new ErrorHandler(
				`Invalid fields : ${invalidFields.join(", ")}`,
				400,
			),
		);
	}
	next();
};
