import {body, param, query} from "express-validator";

export const validateProduct = [
	body("name")
		.trim()
		.notEmpty()
		.withMessage("Product name is required")
		.isLength({min: 3})
		.withMessage("Product name must be at least 3 characters long"),
	body("price")
		.trim()
		.notEmpty()
		.withMessage("Product price is required")
		.isNumeric()
		.withMessage("Product price must be a number")
		.custom((value) => {
			if (value < 0) {
				throw new Error("Price must be a positive number ");
			}
			return true;
		}),
	body("stock")
		.trim()
		.notEmpty()
		.withMessage("Stock is required")
		.isNumeric()
		.withMessage("Stock must be a number")
		.isInt({min: 0})
		.withMessage("Stock must be a positive"),

	body("category")
		.trim()
		.notEmpty()
		.withMessage("Product category is required")
		.isLength({min: 3})
		.withMessage("Product category must be at least 3 characters long"),
	body("image").custom((value, {req}) => {
		if (!req.file) {
			throw new Error("Image is required");
		}
		return true;
	}),
];

// * Find a single product by id validation
export const validateSingleProduct = [
	param("id").notEmpty().withMessage("Product id is required").isMongoId().withMessage("Invalid product id"),
];

// * Update a single product validation

export const validateUpdateProduct = [
	param("id").notEmpty().withMessage("Product id is required").isMongoId().withMessage("Invalid product id"),
	body("name").optional().trim().isLength({min: 3}).withMessage("Product name must be at least 3 characters long"),
	body("price")
		.optional()
		.trim()
		.isNumeric()
		.withMessage("Product price must be a number")
		.custom((value) => {
			if (value < 0) {
				throw new Error("Price must be a positive number ");
			}
			return true;
		}),
	body("stock")
		.optional()
		.trim()
		.isNumeric()
		.withMessage("Stock must be a number")
		.isInt({min: 0})
		.withMessage("Stock must be a positive"),
	body("category")
		.optional()
		.trim()
		.isLength({min: 3})
		.withMessage("Product category must be at least 3 characters long"),
	body("image")
		.optional()
		.custom((value, {req}) => {
			if (!req.file) {
				throw new Error("Image is required");
			}
			return true;
		}),
];

// * Delete a single product validation

export const validateDeleteProduct = [
	param("id").notEmpty().withMessage("Product id is required").isMongoId().withMessage("Invalid product id"),
];

// * Get all product by search query params validation -> only for admin
export const validateGetAllProducts = [
	query("search").optional().isString().withMessage("Search must be a string"),
	query("price").optional().isNumeric().withMessage("Price must be a number"),
];
// body("image")
// 	.optional()
// 	.custom((value, { req }) => {
// 		if (!req.file) {
// 			throw new Error('Image is required');
// 		}
// 		const image = req.file as Express.Multer.File;
// 		if (image.size > 1024 * 1024 * 2) {
// 			throw new Error('Image size must be less than 2MB');
// 		}
// 		// You can add additional checks for image type (e.g., MIME type or extension) here if needed
// 		return true;
// 	})
