import NodeCache from "node-cache";
import logger from "./logger.js";
import {InvalidateCacheProps} from "../types/types.js";

export const nodeCache = new NodeCache({
	stdTTL: 0,
	checkperiod: 120,
	useClones: false,
});

nodeCache.on("set", (key) => {
	logger.info(`Key: ${key} is set in the cache`);
});

nodeCache.on("expired", (key) => {
	logger.info(`Key: ${key} is expired and removed from the cache`);
});

nodeCache.on("del", (key) => {
	logger.info(`Key: ${key} is deleted from the cache`);
});

nodeCache.on("flush", () => {
	logger.info(`Cache is flushed`);
});

nodeCache.on("error", (error) => {
	logger.error(`Error occurred in the cache: ${error}`);
});

// wrap the get method to add logging

const originalGet = nodeCache.get.bind(nodeCache);
nodeCache.get = <T>(key: string): T | undefined => {
	const value = originalGet<T>(key);
	if (value !== undefined) {
		logger.info(`Key: ${key} is retrieved from the cache`);
	}
	return value;
};

// * Node Cache Revalidate / Invalidate Cache

export const invalidateCache = ({
	product,
	order,
	admin,
	coupon,
	couponId,
	userId,
	orderId,
	productId,
}: InvalidateCacheProps) => {
	try {
		if (product) {
			const productsKeys: string[] = ["admin-products", "latestProducts", "categories"];

			if (Array.isArray(productId)) {
				productId.map((id) => {
					productsKeys.push(`product-${id}`);
				});
			}

			if (typeof productId === "string") {
				productsKeys.push(`product-${productId}`);
			}

			nodeCache.del(productsKeys);
		}
		if (order) {
			const orderKeys: string[] = ["all-admin-orders", `my_orders_${userId}`, `order-${orderId}`];

			nodeCache.del(orderKeys);
		}
		if (admin) {
			const adminKeys: string[] = ["admin-stats", "admin-pie-charts", "admin-bar-charts", "admin-line-charts"];
			nodeCache.del(adminKeys);
		}

		if (coupon) {
			const couponKeys: string[] = ["all-coupons"];

			nodeCache.del(couponKeys);
		}
	} catch (error) {
		logger.error(`Error occurred in the cache: ${error}`);
	}
};

// * Filter the keys that have order keys and also my_order_${id}

// export const filterOrderKeys = async () => {
// 	// Get all keys
// 	const allKeys = nodeCache.keys();
//
// 	// 	get all order id from dataBase
// 	const orderId = await Order.find({}).select("_id").lean().exec();
//
// 	// 	convert to Object id to string for iteration
// 	const orderIds: string[] = orderId.map((id) => id._id.toString());
//
// 	// filter the keys
// 	const keys: string[] | undefined = allKeys.filter((key) => {
// 		const startWithOrder = key.startsWith("order-");
// 		if (startWithOrder) {
// 			const id = key.split("-").pop();
// 			return orderIds.find((oId) => oId === id) || undefined;
// 		}
// 	});
//
// 	// get all user id for my-orders${id}
// 	// const userId = await UserModel.find({}).select("_id").lean().exec();
// 	// // convert string for iteration
// 	// const userIds: string[] = userId.map((id) => id._id.toString());
// 	//
// 	// // filter the keys
// 	// const myOrdersKeys: string[] | undefined = allKeys.filter((key: string) => {
// 	// 	const startWithMyOrders = key.startsWith("my_orders_");
// 	//
// 	// 	if (startWithMyOrders) {
// 	// 		const id: string | undefined = key.split("_").pop();
// 	//
// 	// 		return userIds.find((uId) => uId === id) || undefined;
// 	// 	}
// 	// });
//
// 	return keys;
// };

// * Filter the keys that have product-id

// const filterProductKeys = async () => {
// 	// Get all keys which store in the cache
// 	const allKeys = nodeCache.keys();
//
// 	// Get all product id from the database
// 	const productId = await Product.find({}).lean().exec();
// 	// convert the product id to string
// 	const productIds = productId.map((id) => id._id.toString());
//
// 	const key: string[] | undefined = allKeys.filter((key) => {
// 		const productKeys = key.startsWith("product-");
// 		if (productKeys) {
// 			const id = key.split("-").pop();
//
// 			// 	match the product id with the keys and return the id
// 			const matched: string | undefined = productIds.find(
// 				(pId) => pId === id,
// 			);
// 			return matched;
// 		}
// 	});
// 	return key;
// };
