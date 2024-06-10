//  * Middleware to make sure only admin is allowed
import {TryCatch} from "./error.js";
import ErrorHandler from "../utils/utility-class.js";
import {UserModel} from "../models/userModal.js";

export const isAdmin = TryCatch(async (req, res, next) => {
	const {id} = req.query;

	if (!id) return next(new ErrorHandler("Please login first", 401));

	const user = await UserModel.findById({_id: id});
	if (!user) return next(new ErrorHandler("Invalid user", 401));

	if (user.role !== "admin") {
		return next(new ErrorHandler("Forbidden! You are not admin", 403));
	}

	if (user.role === "admin") {
		next();
	}
});
