import {body} from "express-validator";

export const validateUser = [
	body("_id")
		.trim()
		.notEmpty()
		.withMessage("User Id is required")
		.custom((value) => {
			// 	Firebase ID Validation: 28 characters, alphanumeric
			const fireBaseRegex = /^[A-Za-z0-9]{28}$/;
			if (!fireBaseRegex.test(value)) {
				throw new Error("Invalid Id");
			}
			return true;
		}),
	body("name")
		.trim()
		.notEmpty()
		.withMessage("Please provide your name")
		.isLength({
			min: 3,
			max: 50,
		})
		.withMessage("Name must be between 3 and 50 characters"),
	body("email")
		.trim()
		.notEmpty()
		.withMessage("Please provide an email")
		.isEmail()
		.withMessage("Please provide a valid email"),
	body("image").notEmpty().withMessage("Please provide an image"),
	body("gender")
		.notEmpty()
		.withMessage("Please Enter your gender")
		.isIn(["male", "female", "other"])
		.withMessage('Gender must be "male", "female", or "other"'),
	// .custom((value, {req}) => {
	// 	if (!/\.(jpg|jpeg|png)$/.test(value)) {
	// 		throw new Error("Only JPG, JPEG, and PNG images are allowed");
	// 	}
	// 	return true;
	// })
	// .withMessage("Only JPG, JPEG, and PNG images are allowed"),
	body("dob").trim().notEmpty().withMessage("Please provide a date of birth"),
];
