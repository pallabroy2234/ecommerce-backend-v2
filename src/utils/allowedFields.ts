import {Request} from "express";

export const validateAllowedFields = (
	req: Request,
	allowedFields: string[],
) => {
	const bodyKeys = Object.keys(req.body);
	const invalidFields = bodyKeys.filter(
		(key) => !allowedFields.includes(key),
	);

	if (invalidFields.length > 0) {
		return invalidFields;
	}
};

// export const allowedField = (
// 	req: Request,
// 	res: Response,
// 	allowedFields: string[],
// ) => {
// 	const bodyKeys = Object.keys(req.body);
// 	const invalidFields = bodyKeys.filter(
// 		(key) => !allowedFields.includes(key),
// 	);
//
// 	if (invalidFields.length > 0) {
// 		logger.warn(`Invalid fields found: ${invalidFields.join(", ")}`);
// 		return res.status(422).json({
// 			success: false,
// 			message: `Invalid fields found: ${invalidFields.join(", ")}`,
// 		});
// 	}
// };
