import {body, param, query} from "express-validator";

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

export const validateApplyCouponCode = [
	query("coupon")
		.notEmpty()
		.withMessage("Invalid Coupon Code")
		.matches(/^[A-Za-z0-9]+$/)
		.withMessage("Invalid Coupon Code"),
];

/**
 * @desc          Delete Coupon params validation
 * @route         DELETE /api/v1/payment/coupon/:id
 * @access        Private/Admin
 *
 * @validation
 *  - params("id): Coupon ID
 *  - Must be not empty
 *  - Must be a valid MongoDB ID
 *
 *  @erros
 *   - "Coupon ID is required": Returned if the ID parameter is missing.
 *   - "Invalid Id": Returned if the ID parameter is not a valid MongoDB ObjectId.
 *
 * */

export const validateDeleteCoupon = [
	param("id")
		.notEmpty()
		.withMessage("Coupon ID is required")
		.isMongoId()
		.withMessage("Invalid Id"),
];
