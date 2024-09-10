import { UserModel } from "../models/userModel.js";
import { TryCatch } from "../middlewares/error.js";
import ErrorHandler from "../utils/utility-class.js";
import { validateAllowedFields } from "../utils/allowedFields.js";
// * handleNewUser -> /api/v1/user/new
export const handleNewUser = TryCatch(async (req, res, next) => {
    // List fo allowed fields
    const { name, email, gender, image, dob, _id } = req.body;
    let user = await UserModel.findById(_id);
    if (user) {
        const userDob = new Date(user.dob).toISOString().split("T")[0];
        const inputDob = new Date(dob).toISOString().split("T")[0];
        if (userDob !== inputDob) {
            return next(new ErrorHandler("Date of Birth Mismatch", 400));
        }
        else if (user.gender !== gender) {
            return next(new ErrorHandler("Gender Mismatch", 400));
        }
        else {
            return res.status(200).json({
                success: true,
                message: `Welcome back ${name}!`,
            });
        }
    }
    const allowedFields = ["name", "email", "gender", "image", "dob", "_id"];
    //  ! Check for any field that are not allowed
    const invalidFields = validateAllowedFields(req, allowedFields);
    if (invalidFields)
        return next(new ErrorHandler(`Invalid Fields: ${invalidFields.join(", ")}`, 400));
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
});
// * handleGetAllUsers -> /api/v1/user/all
export const handleGetAllUsers = TryCatch(async (req, res, next) => {
    const users = await UserModel.find({});
    return res.status(200).json({
        success: true,
        message: "Get all users",
        payload: users || [],
    });
});
// * handleGetUser -> /api/v1/user/:id
export const handleGetUser = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    const user = await UserModel.findById({ _id: id });
    if (!user)
        return next(new ErrorHandler("Invalid user id", 400));
    return res.status(200).json({
        success: true,
        message: "User details found!",
        payload: user,
    });
});
// * handleDeleteUser -> /api/v1/user/:id
export const handleDeleteUser = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    const user = await UserModel.findById({ _id: id });
    if (!user)
        return next(new ErrorHandler("Invalid user id", 400));
    await user.deleteOne();
    return res.status(200).json({
        success: true,
        message: "User deleted successfully!",
    });
});
