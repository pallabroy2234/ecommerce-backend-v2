import express from "express";
import {handleNewCoupon} from "../controllers/paymentControllers.js";

const paymentRouter = express.Router();

/*
 * @route  POST /api/v1/payment/coupon/new
 * @desc   Create a new coupon
 * @access Private/Admin
 */
paymentRouter.post("/coupon/new", handleNewCoupon);

export default paymentRouter;
