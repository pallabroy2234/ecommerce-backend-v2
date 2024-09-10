import express from "express";
import { isAdmin } from "../middlewares/auth.js";
import { validateApplyCouponCode, validateCreatePaymentIntent, validateDeleteCoupon, validateNewCoupon, } from "../validators/validatePayemnt.js";
import { runValidation } from "../validators/index.js";
import { handleAllCoupons, handleApplyCoupon, handleCreatePaymentIntent, handleDeleteCoupon, handleNewCoupon, } from "../controllers/paymentControllers.js";
const paymentRouter = express.Router();
/**
 * @route      POST /api/v1/payment/create
 * @desc       Create a payment
 * @access     public
 *
 * @handler    handleCreatePaymentIntent: Process the request to create a payment
 */
paymentRouter.post("/create", validateCreatePaymentIntent, runValidation(400), handleCreatePaymentIntent);
/**
 * @route      POST /api/v1/payment/coupon/new
 * @desc       Create a new coupon
 * @access     Private/Admin
 *
 * @handler    handleNewCoupon: Process the request to create a new coupon
 */
paymentRouter.post("/coupon/new", isAdmin, validateNewCoupon, runValidation(400), handleNewCoupon);
/**
 * @route        GET /api/v1/payment/coupon/discount?coupon=COUPON
 * @desc         Get one coupon
 * @access       Private/ Only for user
 *
 * @handler      handleApplyCoupon: Process the request to apply coupon or apply discount
 */
paymentRouter.get("/coupon/discount", validateApplyCouponCode, runValidation(400), handleApplyCoupon);
/**
 * @desc       Get all coupons
 * @route      GET /api/v1/payment/coupon/all
 * @access     Private/Admin
 *
 * @handler    handleAllCoupons: Process the request to get all coupons
 * */
paymentRouter.get("/coupon/all", isAdmin, handleAllCoupons);
/**
 * @desc     Delete single coupon
 * @route    Delete /api/v1/payment/coupon/:id
 * @access   Private/Admin
 *
 * @handler  handleDeleteCoupon : Process the request to delete the coupon
 * */
paymentRouter.delete("/coupon/:id", isAdmin, validateDeleteCoupon, runValidation(400), handleDeleteCoupon);
export default paymentRouter;
