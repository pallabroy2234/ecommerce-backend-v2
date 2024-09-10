import { body, param, query } from "express-validator";
/**
 * @description   Middleware for validating the request body of the create payment intent API endpoint.
 * @route         POST /api/v1/payment/create
 * @access        Public
 *
 * @validation
 *  - "amount":
 *   - Required, must be a positive number.
 *
 * @errors
 *  - "Please enter an amount to proceed with the payment": Returned if the amount field is missing.
 *  - "The amount should be a valid number": Returned if the amount field is not a number.
 *  - "The amount must be greater than zero": Returned if the amount is zero or negative.
 */
export const validateCreatePaymentIntent = [
    body("amount")
        .notEmpty()
        .withMessage("Please enter amount")
        .isNumeric()
        .withMessage("Invalid amount")
        .custom((value) => value >= 59)
        .withMessage("The amount must be at least ৳59."),
];
/**
 * @description Validates the body of the Create New Coupon endpoint.
 *
 * @route      POST /api/v1/payment/coupon
 * @access     Private/Admin
 *
 * @validation
 *  - "coupon":
 *    - Required, must be a string with only letters and numbers.
 *  - "amount":
 *    - Required, must be a positive number.
 *
 * @errors
 *  - "Please enter a coupon code"
 *  - "Coupon code must be a string"
 *  - "Coupon code can only contain letters and numbers"
 *  - "Please enter a discount amount"
 *  - "Invalid discount amount. Please enter a valid amount"
 *  - "Discount amount must be greater than zero"
 */
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
/**
 * @description       Middleware for validation the parameters of the Apply Coupon API endpoint.
 * @route             GET /api/v1/payment/coupon/discount?coupon=COUPON
 * @access            Private/ Only for user
 *
 * @validation
 *  - query("coupon"): Coupon Code
 *  - Must be not empty
 *  - Must be a string
 *  - Must match the regex /^[A-Za-z0-9]+$/
 *  - Must be a valid coupon code
 *
 * @errors
 *  - "Invalid Coupon Code": Returned if the coupon code is missing, not a string, or contains special characters.
 * */
export const validateApplyCouponCode = [
    query("coupon")
        .notEmpty()
        .withMessage("Invalid Coupon Code")
        .matches(/^[A-Za-z0-9]+$/)
        .withMessage("Invalid Coupon Code"),
];
/**
 * @description   Middleware for validating the parameters of the Delete Coupon API endpoint.
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
    param("id").notEmpty().withMessage("Coupon ID is required").isMongoId().withMessage("Invalid Id"),
];
