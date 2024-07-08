import {body, param, query} from "express-validator";

// * validate new order Request body -> /api/v1/order/new
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
		.notEmpty()
		.withMessage("Tax is required")
		.isFloat({min: 0.0})
		.withMessage("Invalid tex")
		.default(0.0),
	body("shippingCharges")
		.notEmpty()
		.withMessage("Shipping Charges is required")
		.isFloat({min: 0.0})
		.withMessage("Invalid shipping charges")
		.default(0.0),
	body("discount")
		.notEmpty()
		.withMessage("Discount is required")
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

	// * Validate shipping info
	body("shippingInfo")
		.notEmpty()
		.withMessage("Shipping Info is required")
		.isObject()
		.withMessage("Invalid shipping info")
		.custom((value) => {
			const requiredFields = [
				"address",
				"country",
				"city",
				"division",
				"postCode",
			];
			const missingFields = requiredFields.filter(
				(field) => !value.hasOwnProperty(field),
			);
			if (missingFields.length > 0) {
				throw new Error(
					`Missing Shipping info fields: ${missingFields.join(", ")}`,
				);
			}
			return true;
		}),
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

	// * Validate order items
	body("orderItems")
		.notEmpty()
		.withMessage("Order items are required")
		.isArray({min: 1})
		.withMessage("Invalid order items"),
	body("orderItems.*.productId")
		.notEmpty()
		.withMessage("Product id is required")
		.isMongoId()
		.withMessage("Invalid product id"),
	body("orderItems.*.quantity")
		.notEmpty()
		.withMessage("Quantity is required")
		.isInt({min: 1})
		.withMessage("Quantity must be at least 1")
		.isNumeric()
		.withMessage("Invalid quantity"),
];

// * validate Get my orders Request Query -> /api/v1/order/myOrders

export const validateMyOrders = [
	query("id")
		.notEmpty()
		.withMessage("User Id is required")
		.isUUID(4)
		.withMessage("Invalid user id"),
];

//  * validate Get order Details Request Params -> /api/v1/order/:id

export const validateOrderDetails = [
	param("id")
		.notEmpty()
		.withMessage("Order Id is required")
		.isMongoId()
		.withMessage("Invalid Id"),
];

// * validate Process Order Request -> /api/v1/order/:id

export const validateProcessOrder = [
	query("id").optional().isUUID(4).withMessage("Invalid id"),
	param("id")
		.notEmpty()
		.withMessage("Order Id is required")
		.isMongoId()
		.withMessage("Invalid Id"),
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
