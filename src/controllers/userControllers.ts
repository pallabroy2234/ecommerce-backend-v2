import {Request, Response, NextFunction} from "express";
import {UserModel} from "../models/userModal.js";
import {NewUserRequestBody} from "../types/types.js";
import {TryCatch} from "../middlewares/error.js";
import ErrorHandler from "../utils/utility-class.js";
import {allowedField} from "../utils/allowedFields.js";

// * handleNewUser -> /api/v1/user/new
export const handleNewUser = TryCatch(
	async (
		req: Request<{}, {}, NewUserRequestBody>,
		res: Response,
		next: NextFunction,
	) => {
		const {name, email, gender, image, dob, _id} = req.body;

		// List fo allowed fields
		const allowedFields = [
			"name",
			"email",
			"gender",
			"image",
			"dob",
			"_id",
		];

		// ! Check for any field that are not allowed
		allowedField(req, res, next, allowedFields);

		let user = await UserModel.findById(_id);

		if (user) {
			return res.status(200).json({
				success: true,
				message: `Welcome back ${name}!`,
			});
		}

		user = await UserModel.create({
			_id,
			name,
			email,
			dob,
			gender,
			image,
		});
		return res.status(201).json({
			success: true,
			message: `Welcome ${user.name}! Your account has been created successfully!`,
		});
	},
);

// * handleGetAllUsers -> /api/v1/user/all
export const handleGetAllUsers = TryCatch(async (req, res, next) => {
	const users = await UserModel.find({});
	return res.status(200).json({
		success: true,
		payload: users,
	});
});

// * handleGetUser -> /api/v1/user/:id
export const handleGetUser = TryCatch(async (req, res, next) => {
	const {id} = req.params;

	const user = await UserModel.findById({_id: id});

	if (!user) return next(new ErrorHandler("Invalid user id", 400));
	return res.status(200).json({
		success: true,
		message: "User details found!",
		payload: user,
	});
});

// * handleDeleteUser -> /api/v1/user/:id
export const handleDeleteUser = TryCatch(async (req, res, next) => {
	const {id} = req.params;

	const user = await UserModel.findById({_id: id});

	if (!user) return next(new ErrorHandler("Invalid user id", 400));

	await user.deleteOne();

	return res.status(200).json({
		success: true,
		message: "User deleted successfully!",
	});
});
