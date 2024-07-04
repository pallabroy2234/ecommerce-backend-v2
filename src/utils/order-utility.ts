import {OrderItemType} from "../types/types.js";
import {Product} from "../models/productModel.js";
import ErrorHandler from "./utility-class.js";
import logger from "./logger.js";

export const reduceStock = async (orderItems: OrderItemType[]) => {
	try {
		for (let i = 0; i < orderItems.length; i++) {
			const order = orderItems[i];
			const product = await Product.findById({_id: order.productId});
			if (!product) {
				return new ErrorHandler(
					`Product not found with id: ${order.productId}`,
					404,
				);
			}
			product.stock = product.stock - order.quantity;
			await product.save();
		}
	} catch (err: any) {
		// Handle specific MongoDB errors or other unexpected errors
		if (err.name === "MongoError") {
			logger.error(`MongoDB error: ${err.message}`);
			return new ErrorHandler(`MongoDB error: ${err.message}`, 500);
		} else {
			logger.error(`Error reducing stock: ${err.message}`);
			return new ErrorHandler(
				`Error reducing stock: ${err.message}`,
				500,
			);
		}
	}
};
