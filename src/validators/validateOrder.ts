import {body} from "express-validator";

export const validateNewOrder = [
	body("user")
		.trim()
		.notEmpty()
		.withMessage("User Id is required")
		.isUUID(4)
		.withMessage("Invalid user id"),
	body("subtotal")
		.notEmpty()
		.withMessage("Subtotal is required")
		.isFloat({min: 0.0})
		.withMessage("Invalid subtotal"),
	body("tax")
		.optional()
		.isFloat({min: 0.0})
		.withMessage("Invalid tex")
		.default(0.0),
	body("discount")
		.optional()
		.isFloat({min: 0.0, max: 100.0})
		.withMessage("Discount must be between 0 and 100")
		.default(0.0),
	body("total")
		.notEmpty()
		.withMessage("Total is required")
		.isFloat({min: 0.0})
		.withMessage("Invalid total"),
	body("status")
		.optional()
		.isString()
		.isIn(["processing", "shipped", "delivered", "cancelled"])
		.withMessage("Invalid status")
		.default("processing"),
	body("shippingInfo")
		.notEmpty()
		.withMessage("Shipping Info is required")
		.isObject()
		.withMessage("Invalid shipping info"),
	body("shippingInfo.address")
		.notEmpty()
		.withMessage("Please enter your shipping address")
		.isString()
		.withMessage("Invalid address")
		.trim(),
	body("shippingInfo.country")
		.notEmpty()
		.withMessage("Please enter your shipping country")
		.isString()
		.withMessage("Invalid country")
		.trim(),
	body("shippingInfo.city")
		.notEmpty()
		.withMessage("Please enter your shipping city")
		.isString()
		.withMessage("Invalid city")
		.trim(),
	body("shippingInfo.division")
		.notEmpty()
		.withMessage("Please enter your shipping division")
		.isString()
		.withMessage("Invalid division")
		.trim(),
	body("shippingInfo.postCode")
		.notEmpty()
		.withMessage("Please enter your shipping post code")
		.isInt()
		.withMessage("Invalid post code")
		.isLength({min: 4, max: 6})
		.withMessage("Invalid post code"),
	body("orderItems")
		.isArray({min: 1})
		.withMessage("Order items are required"),
	body("orderItems.*.productId")
		.notEmpty()
		.withMessage("Product id is required")
		.isMongoId()
		.withMessage("Invalid product id"),
	body("orderItems.*.name")
		.trim()
		.notEmpty()
		.withMessage("Please provide the product name")
		.isString()
		.isLength({min: 3})
		.withMessage("Name must be at least 3 characters"),
	body("orderItems.*.quantity")
		.notEmpty()
		.withMessage("Quantity is required")
		.isInt({min: 1})
		.withMessage("Quantity must be at least 1"),
	body("orderItems.*.price")
		.notEmpty()
		.withMessage("Price is required")
		.isFloat({min: 0.0})
		.withMessage("Price must be a positive number"),
	body("orderItems.*.image")
		.notEmpty()
		.withMessage("Image is required")
		.isString()
		.withMessage("Invalid image URL"),
];

// body("shippingInfo")
// 	.notEmpty()
// 	.withMessage("Shipping Info is required")
// 	.isObject()
// 	.withMessage("Invalid shipping info")
// 	.custom((value) => {
// 		if (
// 			!value.hasOwnProperty("address") ||
// 			!value.hasOwnProperty("country") ||
// 			!value.hasOwnProperty("city") ||
// 			!value.hasOwnProperty("division")
// 		) {
// 			throw new Error("Invalid shipping info");
// 		}
// 		return true;
// 	}),
