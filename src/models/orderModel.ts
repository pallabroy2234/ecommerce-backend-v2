import {model, Schema, Types} from "mongoose";

interface IOrder {
	user: string;
	subtotal: number;
	tax: number;
	discount: number;
	total: number;
	status: string;
	shippingInfo: {
		address: string;
		country: string;
		city: string;
		division: string;
		postCode: number;
	};
	orderItems: [
		{
			productId: string;
			name: string;
			quantity: number;
			price: number;
			image: string;
		},
	];
}

const orderSchema = new Schema(
	{
		user: {
			type: String,
			trim: true,
			required: [true, "User id is required"],
			ref: "User",
		},
		subtotal: {
			type: Number,
			trim: true,
			required: [true, "Subtotal is required"],
			default: 0.0,
		},
		tax: {
			type: Number,
			trim: true,
			required: [true, "Tax is required"],
			default: 0.0,
		},
		discount: {
			type: Number,
			required: [true, "Discount is required"],
			default: 0.0,
		},
		total: {
			type: Number,
			required: [true, "Total is required"],
			default: 0.0,
		},
		status: {
			type: String,
			enum: ["Processing", "Shipped", "Delivered", "Cancelled"],
			default: "Processing",
		},
		shippingInfo: {
			address: {
				type: String,
				trim: true,
				required: [true, "Please enter your shipping address"],
			},
			country: {
				type: String,
				trim: true,
				required: [true, "Please enter your country"],
			},
			city: {
				type: String,
				trim: true,
				required: [true, "Please enter your city"],
			},
			division: {
				type: String,
				trim: true,
				required: [true, "Please enter your division"],
			},
			postCode: {
				type: Number,
				trim: true,
				required: [true, "Please enter your post code"],
			},
		},
		orderItems: [
			{
				productId: {
					type: Types.ObjectId,
					ref: "Product",
					required: [true, "Product id is required"],
				},
				name: {
					type: String,
					minLength: [3, "Name must be at least 3 characters"],
					required: [true, "Please provide your name"],
					trim: true,
				},
				quantity: {
					type: Number,
					required: [true, "Quantity is required"],
					default: 0,
				},
				price: {
					type: Number,
					required: [true, "Price is required"],
					default: 0,
				},
				image: {
					type: String,
					required: [true, "Image is required"],
				},
			},
		],
	},
	{
		timestamps: true,
	},
);
export const Order = model<IOrder>("orders", orderSchema);
