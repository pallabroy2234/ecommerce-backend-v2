import express from "express";
import {handleNewCoupon} from "../controllers/paymentControllers.js";
import {validateNewCoupon} from "../validators/validatePayemnt.js";
import {runValidation} from "../validators/index.js";
import {isAdmin} from "../middlewares/auth.js";

const paymentRouter = express.Router();

/*
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

export default paymentRouter;
