import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
	{
		code: {
			type: String,
			uppercase: true,
			required: [true, "Please enter Coupon Code"],
			trim: true,
		},
		amount: {
			type: Number,
			required: [true, "Please enter Discount Amount"],
		},
	},
	{timestamps: true},
);

export const Coupon = mongoose.model("Coupon", couponSchema);
