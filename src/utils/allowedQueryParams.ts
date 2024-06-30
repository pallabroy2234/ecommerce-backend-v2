import {Request} from "express";

export const validateAllowedQueryParams = (
	req: Request<{}, {}, {}, {}>,
	allowedParams: string[],
): string[] | undefined => {
	const queryKeys = Object.keys(req.query);
	const invalidParams = queryKeys.filter(
		(key) => !allowedParams.includes(key),
	);

	if (invalidParams.length > 0) {
		return invalidParams;
	}
	return undefined;
};
