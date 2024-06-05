import {Request, Response, NextFunction} from "express";
import UserModal from "../models/userModal.js";
import {NewUserRequestBody} from "../types/types.js";

// * handleNewUser -> /api/v1/user/new
export const handleNewUser = async (req: Request<{}, {}, NewUserRequestBody>, res: Response, next: NextFunction) => {
	try {
		const {name, email, role, gender, image, dob, _id} = req.body;

		const user = await UserModal.create({
			_id,
			name,
			email,
			image,
			dob,
			role,
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
