import express from "express";
import {isAdmin} from "../middlewares/auth.js";
import {
	validateApplyCouponCode,
	validateNewCoupon,
} from "../validators/validatePayemnt.js";
import {runValidation} from "../validators/index.js";
import {
	handleApplyCoupon,
	handleNewCoupon,
} from "../controllers/paymentControllers.js";

const paymentRouter = express.Router();

/**
 * @route  POST /api/v1/payment/coupon/new
 * @desc   Create a new coupon
 * @access Private/Admin
 */
paymentRouter.post(
	"/coupon/new",
	isAdmin,
	validateNewCoupon,
	runValidation(400),
	handleNewCoupon,
);

/**
 * @route  GET /api/v1/payment/coupon/discount?coupon=COUPON
 * @desc   Get one coupon
 * @access Private/ Only for user
 */

paymentRouter.get(
	"/coupon/discount",
	validateApplyCouponCode,
	runValidation(400),
	handleApplyCoupon,
);

export default paymentRouter;
