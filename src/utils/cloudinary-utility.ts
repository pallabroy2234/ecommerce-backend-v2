import {v2 as cloudinary} from "cloudinary";
import ErrorHandler from "./utility-class";
import {deleteImage} from "../validators";

export const publicIdWithOutExtensionFromUrl = (imageUrl: string) => {
	const pathSegments = imageUrl.split("/");
	const lastSegment = pathSegments[pathSegments.length - 1];
	return lastSegment.split(".")[0];
};

export const deleteImageFromCloudinary = async (folderName: string, publicId: string) => {
	try {
		const {result} = await cloudinary.uploader.destroy(`${folderName}/${publicId}`);
		if (result !== "ok") {
			return new ErrorHandler("Failed to delete image", 400);
		}
	} catch (err: any) {
		return new ErrorHandler(err.message, 500);
	}
};
