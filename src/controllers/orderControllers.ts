import {TryCatch} from "../middlewares/error.js";
import {Request, Response, NextFunction} from "express";
import {NewOrderRequestBody} from "../types/types.js";
import {ShippingInfoType} from "../types/types.js";
import {Order} from "../models/orderModel.js";

export const handleNewOrder = TryCatch(
	async (
		req: Request<{}, {}, NewOrderRequestBody>,
		res: Response,
		next: NextFunction,
	) => {
		const {
			shippingInfo,
			orderItems,
			user,
			subtotal,
			shippingCharges,
			tax,
			total,
			discount,
		} = req.body;

		const order = await Order.create({
			shippingInfo,
			orderItems,
			user,
			subtotal,
			shippingCharges,
			tax,
			total,
			discount,
		});
	},
);
