import { TryCatch } from "../middlewares/error.js";
import { Coupon } from "../models/couponModal.js";
import ErrorHandler from "../utils/utility-class.js";
import { validateAllowedFields } from "../utils/allowedFields.js";
import { validateAllowedQueryParams } from "../utils/allowedQueryParams.js";
import { invalidateCache, nodeCache } from "../utils/nodeCache.js";
import { stripe } from "../app.js";
/**
 * @description     Handles the creation of a new payment.
 * @route           POST /api/v1/payment/create
 * @access          Public
 */
export const handleCreatePaymentIntent = TryCatch(async (req, res, next) => {
    const { amount } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
        amount: Number(amount) * 100,
        currency: "bdt",
    });
    return res.status(201).json({
        success: true,
        message: "Payment intent created successfully",
        payload: paymentIntent.client_secret,
    });
});
/**
 * @description     Handles the creation of a new coupon.
 * @route           POST /api/v1/payment/coupon/new
 * @access          Private/Admin
 */
export const handleNewCoupon = TryCatch(async (req, res, next) => {
    const { coupon, amount } = req.body;
    const allowed = ["coupon", "amount"];
    // Check for any field that are not allowed
    const checkFields = validateAllowedFields(req, allowed);
    if (checkFields) {
        return next(new ErrorHandler(`Invalid fields: ${checkFields.join(", ")}`, 400));
    }
    const isExists = await Coupon.findOne({ code: coupon });
    // check if coupon code already exists
    if (isExists) {
        return next(new ErrorHandler(`Coupon code ${coupon} already exists.`, 409));
    }
    await Coupon.create({
        code: coupon,
        amount,
    });
    invalidateCache({ coupon: true });
    return res.status(201).json({
        success: true,
        message: `Coupon code ${coupon} has been successfully created.`,
    });
});
/**
 * @description      Handles the application of a coupon code to a purchase.
 * @route            GET /api/v1/payment/coupon/discount?coupon=COUPON
 * @access           Private/ Only for user
 */
export const handleApplyCoupon = TryCatch(async (req, res, next) => {
    const { coupon } = req.query;
    const allowed = ["coupon"];
    const checkQueryParams = validateAllowedQueryParams(req, allowed);
    if (checkQueryParams) {
        return next(new ErrorHandler("Invalid input. Please try again", 400));
    }
    // Check discount or coupon existing
    const discount = await Coupon.findOne({ code: coupon });
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
});
/**
 * @description    Handles the retrieval of all coupons.
 * @route  GET /api/v1/payment/coupon/all
 * @access Private/Admin
 * */
export const handleAllCoupons = TryCatch(async (req, res, next) => {
    let coupons = [];
    const key = `all-coupons`;
    if (nodeCache.has(key)) {
        coupons = JSON.parse(nodeCache.get(key));
    }
    else {
        coupons = await Coupon.find({});
        nodeCache.set(key, JSON.stringify(coupons));
    }
    return res.status(coupons.length > 0 ? 200 : 404).json({
        success: coupons.length > 0,
        message: coupons.length > 0 ? "All coupons" : "No coupons found",
        payload: coupons,
    });
});
/**
 * @description    Handles the deletion of a single coupon by its ID.
 * @route          DELETE /api/v1/payment/coupon/:id
 * @access         Private/Admin
 * */
export const handleDeleteCoupon = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    const deleteCoupon = await Coupon.findByIdAndDelete(id);
    if (!deleteCoupon) {
        return next(new ErrorHandler("Coupon not found", 404));
    }
    // Invalidate Cache
    invalidateCache({ coupon: true });
    return res.status(200).json({
        success: true,
        message: "Coupon deleted successfully",
    });
});
