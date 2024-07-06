import {Product} from "../models/productModel.js";
import ErrorHandler from "./utility-class.js";
import {Request} from "express";
import {ShippingInfoType} from "../types/types.js";
import logger from "./logger.js";

// * Order Processing
export const orderProcessing = async (orderItems: any) => {
	try {
		let processOrderItems = [];
		let allOrderProductId = [];

		// * Collect all product IDs to check for duplicates
		for (let order of orderItems) {
			allOrderProductId.push(order.productId);
		}

		// Check for duplicates
		const duplicates = allOrderProductId.filter(
			(id, index, self) => self.indexOf(id) !== index,
		);

		if (duplicates.length > 0) {
			const duplicateNames = [];
			for (let id of duplicates) {
				const product = await Product.findById({_id: id}).select(
					"name",
				);

				if (product) {
					duplicateNames.push(product.name);
				}
			}
			return new ErrorHandler(
				`Order contains duplicate product(s): ${duplicateNames.join(", ")}`,
				400,
			);
		}

		// Process each order item since no duplicates were found
		for (let order of orderItems) {
			const product = await Product.findById({
				_id: order.productId,
			}).select("name image price stock");

			if (!product) {
				return new ErrorHandler(
					`Product not found with id: ${order.productId}`,
					404,
				);
			}

			product.stock = product.stock - order.quantity;
			await product.save();
			processOrderItems.push({
				productId: order.productId,
				name: product.name,
				image: product.image,
				price: product.price,
				quantity: order.quantity,
			});
		}

		return processOrderItems;
	} catch (e: any) {
		logger.error(`Invalid order processing: ${e.message}`);
		return new ErrorHandler(`Invalid order processing: ${e.message}`, 500);
	}
};

// * validate ShippingInfo allowed fields
export const validateShippingInfoFields = (req: Request) => {
	const allowedFields: (keyof ShippingInfoType)[] = [
		"address",
		"country",
		"city",
		"division",
		"postCode",
	];

	const bodyKeys = Object.keys(req.body.shippingInfo);
	const invalidFields = bodyKeys.filter(
		(key) => !allowedFields.includes(key as keyof ShippingInfoType),
	);
	if (invalidFields.length > 0) {
		return new ErrorHandler(
			`Invalid shipping info field: ${invalidFields.join(", ")}`,
			400,
		);
	}
	return null;
};

// * validate orderItems allowed fields using Set Method and return error if invalid fields are return all invalid fields

export const validateOrderItemsFields = (req: Request) => {
	let allKeys: Set<string> = new Set();
	let allowedKeys: Set<string> = new Set(["productId", "quantity"]);
	let invalid: Set<string> = new Set();

	// 	Iterate through each product
	req.body.orderItems.forEach((item: any) => {
		Object.keys(item).forEach((key) => allKeys.add(key));

		// 	Check for keys that are not allowed

		Object.keys(item).forEach((key) => {
			if (!allowedKeys.has(key)) {
				invalid.add(key);
			}
		});
	});

	// 	If there are invalid keys, return an error
	if (invalid.size > 0) {
		return new ErrorHandler(
			`Invalid order items field: ${[...invalid].join(", ")}`,
			400,
		);
	}
	return null;
};

// * validate orderItems allowed fields using Array Method

// export const validateOrderItemsFields = (req: Request) => {
// 	const allowedFields: (keyof OrderItemType)[] = ["productId", "quantity"];
// 	let invalid: string[] = [];
//
// 	for (let i = 0; i < req.body.orderItems.length; i++) {
// 		const bodyKeys = Object.keys(req.body.orderItems[i]);
//
// 		console.log(bodyKeys, "bodyKeys");
//
// 		bodyKeys.forEach((key) => {
// 			if (!allowedFields.includes(key as keyof OrderItemType)) {
// 				console.log(key, "key");
// 				invalid.push(key);
// 			}
// 		});
// 		console.log(invalid);
// 		if (invalid.length > 0) {
// 			return new ErrorHandler(
// 				`Invalid fields found: ${invalid.join(", ")}`,
// 				400,
// 			);
// 		}
// 	}
// };

// export const reduceStock = async (orderItems: OrderItemType[]) => {
// 	try {
// 		for (let i = 0; i < orderItems.length; i++) {
// 			const order = orderItems[i];
// 			const product = await Product.findById({_id: order.productId});
//
// 			if (!product) {
// 				return new ErrorHandler(
// 					`Product not found with id: ${order.productId}`,
// 					404,
// 				);
// 			}
//
// 			product.stock = product.stock - order.quantity;
// 			await product.save();
// 		}
// 	} catch (err: any) {
// 		// Handle specific MongoDB errors or other unexpected errors
// 		if (err.name === "MongoError") {
// 			logger.error(`MongoDB error: ${err.message}`);
// 			return new ErrorHandler(`MongoDB error: ${err.message}`, 500);
// 		} else {
// 			logger.error(`Error reducing stock: ${err.message}`);
// 			return new ErrorHandler(
// 				`Error reducing stock: ${err.message}`,
// 				500,
// 			);
// 		}
// 	}
// };
