import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
	{
		coupon: {
			type: String,
			required: [true, "Please enter Coupon Code"],
			unique: true,
			trim: true,
		},
		amount: {
			type: Number,
			required: [true, "Please enter Discount Amount"],
		},
	},
	{timestamps: true},
);

const Coupon = mongoose.model("Coupon", couponSchema);
