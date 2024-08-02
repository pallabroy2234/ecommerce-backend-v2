import {TryCatch} from "../middlewares/error.js";
import {NextFunction, Request, Response} from "express";
import {Coupon} from "../models/couponModal.js";
import ErrorHandler from "../utils/utility-class.js";
import {throws} from "node:assert";
import {validateAllowedFields} from "../utils/allowedFields.js";

/**
 * @desc    Create a new coupon
 * @route   POST /api/v1/payment/coupon/new
 * @access  Private/Admin
 */
export const handleNewCoupon = TryCatch(
	async (req: Request, res: Response, next: NextFunction) => {
		const {coupon, amount} = req.body;
		const allowed = ["coupon", "amount"];

		// Check for any field that are not allowed
		const checkFields = validateAllowedFields(req, allowed);
		if (checkFields) {
			return next(
				new ErrorHandler(
					`Invalid fields: ${checkFields.join(", ")}`,
					400,
				),
			);
		}

		const isExists = await Coupon.findOne({code: coupon});
		// check if coupon code already exists
		if (isExists) {
			return next(
				new ErrorHandler(`Coupon code ${coupon} already exists.`, 409),
			);
		}

		await Coupon.create({
			code: coupon,
			amount,
		});

		return res.status(201).json({
			success: true,
			message: `Coupon code ${coupon} has been successfully created.`,
		});
	},
);
