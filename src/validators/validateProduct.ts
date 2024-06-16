import {body} from "express-validator";

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
