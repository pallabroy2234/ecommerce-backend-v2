import {TryCatch} from "../middlewares/error.js";
import {NextFunction, Request, Response} from "express";
import {Coupon} from "../models/couponModal.js";
import ErrorHandler from "../utils/utility-class.js";
import {throws} from "node:assert";
import {validateAllowedFields} from "../utils/allowedFields.js";
import {validateAllowedQueryParams} from "../utils/allowedQueryParams.js";
import {invalidateCache, nodeCache} from "../utils/nodeCache.js";

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

		await invalidateCache({coupon: true});

		return res.status(201).json({
			success: true,
			message: `Coupon code ${coupon} has been successfully created.`,
		});
	},
);

/**
 * @desc    Get one coupon || Apply coupon
 * @route   GET /api/v1/payment/coupon/discount?coupon=COUPON
 * @access  Private/ Only for user
 */

export const handleApplyCoupon = TryCatch(
	async (req: Request, res: Response, next: NextFunction) => {
		const {coupon} = req.query;
		const allowed = ["coupon"];
		console.log(coupon);
		const checkQueryParams = validateAllowedQueryParams(req, allowed);

		if (checkQueryParams) {
			return next(
				new ErrorHandler("Invalid input. Please try again", 400),
			);
		}

		// Check discount or coupon existing
		const discount = await Coupon.findOne({code: coupon});

		if (!discount) {
			return next(new ErrorHandler("Invalid Coupon Code", 400));
		}
		return res.status(200).json({
			success: true,
			message: "Coupon has been successfully applied",
			payload: {
				discount: discount.amount,
			},
		});
	},
);

/**
 * @desc   Get all coupons
 * @route  GET /api/v1/payment/coupon/all
 * @access Private/Admin
 * */

export const handleAllCoupons = TryCatch(
	async (req: Request, res: Response, next: NextFunction) => {
		let coupons = [];
		const key = `all-coupons`;

		if (nodeCache.has(key)) {
			coupons = JSON.parse(nodeCache.get(key) as string);
		} else {
			coupons = await Coupon.find({});
			nodeCache.set(key, JSON.stringify(coupons));
		}

		return res.status(coupons.length > 0 ? 200 : 404).json({
			success: coupons.length > 0,
			message: coupons.length > 0 ? "All coupons" : "No coupons found",
			payload: coupons,
		});
	},
);

/**
 * @desc    Delete Single Coupon
 * @route   DELETE /api/v1/payment/coupon/:id
 * @access  Private/Admin
 * */

export const handleDeleteCoupon = TryCatch(
	async (req: Request, res: Response, next: NextFunction) => {
		const {id} = req.params;

		const deleteCoupon = await Coupon.findByIdAndDelete(id);

		if (!deleteCoupon) {
			return next(new ErrorHandler("Coupon not found", 404));
		}

		// Invalidate Cache
		await invalidateCache({coupon: true});

		return res.status(200).json({
			success: true,
			message: "Coupon deleted successfully",
		});
	},
);
