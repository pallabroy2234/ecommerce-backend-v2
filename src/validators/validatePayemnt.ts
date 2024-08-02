import {body} from "express-validator";

export const validateNewCoupon = [
	body("coupon")
		.notEmpty()
		.withMessage("Please enter a coupon code")
		.isString()
		.withMessage("Coupon code must be a string")
		.matches(/^[A-Za-z0-9]+$/)
		.withMessage("Coupon code can only contain letters and numbers"),

	body("amount")
		.notEmpty()
		.withMessage("Please enter a discount amount")
		.matches(/^\d+(\.\d+)?$/)
		.withMessage("Invalid discount amount. Please enter a valid amount")
		.custom((value) => {
			// Convert value to number and check if it's positive
			const numericValue = parseFloat(value);
			if (numericValue <= 0) {
				throw new Error("Discount amount must be greater than zero");
			}
			return true;
		}),
];
