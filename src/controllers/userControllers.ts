import {Request, Response, NextFunction} from "express";
import UserModal from "../models/userModal.js";
import {NewUserRequestBody} from "../types/types.js";
import {TryCatch} from "../middlewares/error.js";

// * handleNewUser -> /api/v1/user/new
export const handleNewUser = TryCatch(async (req: Request<{}, {}, NewUserRequestBody>, res: Response, next: NextFunction) => {
	const {name, email, gender, image, dob, _id} = req.body;

	let user = await UserModal.findById(_id);

	if (user) {
		return res.status(200).json({
			success: true,
			message: `Welcome back ${name}!`,
			payload: user,
		});
	}

	user = await UserModal.create({
		_id,
		name,
		gender,
		email,
		image,
		dob,
	});
	return res.status(201).json({
		success: true,
		message: `Welcome ${name}! Your account has been created successfully!`,
	});
});
