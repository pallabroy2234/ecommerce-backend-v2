import {TryCatch} from "../middlewares/error.js";
import {NextFunction, Request, Response} from "express";

/**
 * @desc    Create a new coupon
 * @route   POST /api/v1/payment/coupon/new
 * @access  Private/Admin
 */
export const handleNewCoupon = TryCatch(
	async (req: Request, res: Response, next: NextFunction) => {},
);
