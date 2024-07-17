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
import {validateAllowedQueryParams} from "../utils/allowedQueryParams.js";

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

		await invalidateCache({
			product: true,
			order: true,
			admin: true,
			userId: req.body.user.toString(),
		});

		return res.status(201).json({
			success: true,
			message: "Order placed successfully",
			payload: createOrder,
		});
	},
);

// * Get my orders handler -> /api/v1/order/myOrders

export const handlerMyOrders = TryCatch(
	async (req: Request, res: Response, next: NextFunction) => {
		const {id} = req.query;

		const allowedQueryParams: string[] = ["id"];
		const invalidQuery: string[] | undefined = validateAllowedQueryParams(
			req,
			allowedQueryParams,
		);
		if (invalidQuery) {
			return next(
				new ErrorHandler(
					`Invalid query params: ${invalidQuery.join(", ")}`,
					400,
				),
			);
		}

		let orders = [];

		if (nodeCache.has(`my_orders_${id}`)) {
			orders = JSON.parse(nodeCache.get(`my_orders_${id}`) as string);
		} else {
			orders = await Order.find({user: id}).sort({createdAt: -1});
			// Cache the orders
			nodeCache.set(`my_orders_${id}`, JSON.stringify(orders));
		}

		return res.status(orders.length > 0 ? 200 : 404).json({
			success: orders.length > 0,
			message: orders.length > 0 ? "My orders" : "No orders found",
			payload: orders,
		});
	},
);

// * Get all orders handler -> /api/v1/order/all

export const handleGetAllOrders = TryCatch(
	async (req: Request, res: Response, next: NextFunction) => {
		let orders = [];
		if (nodeCache.has("all-admin-orders")) {
			orders = JSON.parse(nodeCache.get("all-admin-orders") as string);
		} else {
			orders = await Order.find({})
				.sort({createdAt: -1})
				.populate("user", "name");

			nodeCache.set("all-admin-orders", JSON.stringify(orders));
		}

		return res.status(orders.length > 0 ? 200 : 404).json({
			success: orders.length > 0,
			message: orders.length > 0 ? "Fet all orders" : "No orders found",
			payload: orders,
		});
	},
);

// * Get Order details handler -> /api/v1/order/:id

export const handleGetOrderDetails = TryCatch(
	async (req: Request, res: Response, next: NextFunction) => {
		const {id} = req.params;

		const key: string = `order-${id}`;
		let order;

		if (nodeCache.has(key)) {
			order = JSON.parse(nodeCache.get(key) as string);
		} else {
			order = await Order.findById(id).populate("user", "name");
			// 	cache the order
			nodeCache.set(key, JSON.stringify(order));
		}

		return res.status(order ? 200 : 404).json({
			success: !!order,
			message: order ? "Fetch order details" : "Order not found",
			payload: order ? order : {},
		});
	},
);

// * Process Order handler -> /api/v1/order/:id
export const handleProcessOrder = TryCatch(
	async (req: Request, res: Response, next: NextFunction) => {
		const {id} = req.params;

		const order = await Order.findById(id);

		if (!order) {
			return next(new ErrorHandler("Order not found", 404));
		}

		// 	change order status

		switch (order.status) {
			case "processing":
				order.status = "shipped";
				break;
			case "shipped":
				order.status = "delivered";
				break;
			default:
				order.status = "delivered";
				break;
		}

		await order.save();

		// 	 Invalidate cache
		await invalidateCache({
			product: false,
			order: true,
			admin: true,
			userId: order.user,
			orderId: order._id.toString(),
		});

		return res.status(200).json({
			success: true,
			message: "Order processed successfully",
		});
	},
);

// * Delete Order handler -> /api/v1/order/:id

export const handleDeleteOrder = TryCatch(
	async (req: Request, res: Response, next: NextFunction) => {
		const {id} = req.params;

		const deleteOrder = await Order.findByIdAndDelete(id);

		if (!deleteOrder) {
			return next(new ErrorHandler("Order not found", 404));
		}

		await invalidateCache({
			product: true,
			order: true,
			admin: true,
			userId: deleteOrder.user,
			orderId: id,
		});

		return res.status(200).json({
			success: true,
			message: "Order deleted successfully",
		});
	},
);
