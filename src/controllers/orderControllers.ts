import {TryCatch} from "../middlewares/error.js";
import {Request, Response, NextFunction} from "express";
import {NewOrderRequestBody} from "../types/types.js";
import {Order} from "../models/orderModel.js";
import {
	orderProcessing,
	validateOrderItemsFields,
	validateShippingInfoFields,
} from "../utils/order-utility.js";
import {invalidateCache, nodeCache} from "../utils/nodeCache.js";
import {validateAllowedFields} from "../utils/allowedFields.js";
import ErrorHandler from "../utils/utility-class.js";

// * New Order handler -> /api/v1/order/new
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
		// Check if there is an error
		if (validateOrderField instanceof Error) {
			return next(validateOrderField);
		}
		// Validate shippingInfo fields
		const shippingInfoFields = validateShippingInfoFields(req);
		// Check if there is an error
		if (shippingInfoFields instanceof Error) {
			return next(shippingInfoFields);
		}

		// Process order or rearrange order items
		const order = await orderProcessing(req.body.orderItems);

		// Check if there is an error
		if (order instanceof ErrorHandler) {
			return next(order);
		}

		// Create order
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

// * Get my orders handler -> /api/v1/orders/myOrders

export const handlerMyOrders = TryCatch(
	async (req: Request, res: Response, next: NextFunction) => {
		const {id} = req.query;

		let orders = [];

		const o = await Order.find({user: id}).sort({createdAt: -1});

		if (nodeCache.has(`my-orders-${id}`)) {
			orders = JSON.parse(nodeCache.get(`my-orders-${id}`) as string);
		} else {
			orders = await Order.find({user: id}).sort({createdAt: -1});
			// Cache the orders
			nodeCache.set(`my-orders-${id}`, JSON.stringify(orders));
		}

		return res.status(orders.length > 0 ? 200 : 404).json({
			success: orders.length > 0,
			message: orders.length > 0 ? "My orders" : "No orders found",
			payload: orders,
		});
	},
);
