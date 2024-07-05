import {TryCatch} from "../middlewares/error.js";
import {Request, Response, NextFunction} from "express";
import {NewOrderRequestBody, ShippingInfoType} from "../types/types.js";
import {Order} from "../models/orderModel.js";
import {
	orderProcessing,
	validateOrderItemsFields,
	validateShippingInfoFields,
} from "../utils/order-utility.js";
import {invalidateCache} from "../utils/nodeCache.js";
import {validateAllowedFields} from "../utils/allowedFields.js";
import ErrorHandler from "../utils/utility-class.js";

export const handleNewOrder = TryCatch(
	async (
		req: Request<{}, {}, NewOrderRequestBody>,
		res: Response,
		next: NextFunction,
	) => {
		// validate allowed fields
		const newOrderRequestBody: (keyof NewOrderRequestBody)[] = [
			"shippingInfo",
			"orderItems",
			"user",
			"subtotal",
			"shippingCharges",
			"tax",
			"total",
			"status",
			"discount",
		];

		const allowedFields: string[] | undefined = validateAllowedFields(
			req,
			newOrderRequestBody,
		);

		if (allowedFields) {
			return next(
				new ErrorHandler(
					`Invalid fields found: ${allowedFields.join(", ")}`,
					400,
				),
			);
		}

		//  Validate orderItems fields
		const validateOrderField = validateOrderItemsFields(req);
		if (validateOrderField instanceof Error) {
			return next(validateOrderField);
		}
		// Validate shippingInfo fields
		const shippingInfoFields = validateShippingInfoFields(req);
		if (shippingInfoFields instanceof Error) {
			return next(shippingInfoFields);
		}

		const order = await orderProcessing(req.body.orderItems);

		// Check if there is an error
		if (order instanceof Error) {
			return next(order);
		}
		// Create new order
		const createOrder = await Order.create({
			...req.body,
			orderItems: order,
		});

		await invalidateCache({product: true, order: true, admin: true});

		return res.status(201).json({
			success: true,
			message: "Order placed successfully",
			payload: createOrder,
		});
	},
);
