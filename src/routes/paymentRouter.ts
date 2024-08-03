import express from "express";
import {isAdmin} from "../middlewares/auth.js";
import {
	validateApplyCouponCode,
	validateDeleteCoupon,
	validateNewCoupon,
} from "../validators/validatePayemnt.js";
import {runValidation} from "../validators/index.js";
import {
	handleAllCoupons,
	handleApplyCoupon,
	handleDeleteCoupon,
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

/**
 * @desc   Get all coupons
 * @route  GET /api/v1/payment/coupon/all
 * @access Private/Admin
 * */

paymentRouter.get("/coupon/all", isAdmin, handleAllCoupons);

/**
 * @desc     Delete single coupon
 * @route    Delete /api/v1/payment/coupon/:id
 * @access   Private/Admin
 * */

paymentRouter.delete(
	"/coupon/:id",
	isAdmin,
	validateDeleteCoupon,
	runValidation(400),
	handleDeleteCoupon,
);

export default paymentRouter;
