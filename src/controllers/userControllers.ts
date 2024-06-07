import {Request, Response, NextFunction} from "express";
import UserModal from "../models/userModal.js";
import {NewUserRequestBody} from "../types/types.js";
import ErrorHandler from "../utils/utility-class.js";

// * handleNewUser -> /api/v1/user/new
export const handleNewUser = async (req: Request<{}, {}, NewUserRequestBody>, res: Response, next: NextFunction) => {
	try {
		const {name, email, gender, image, dob, _id} = req.body;
		const user = await UserModal.create({
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
			payload: user,
		});
	} catch (error) {
		next(error);
	}
};
