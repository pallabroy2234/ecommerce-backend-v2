import NodeCache from "node-cache";
import logger from "./logger.js";
import {InvalidateCacheProps} from "../types/types.js";
import {Product} from "../models/productModel.js";

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

// * Filter the keys that have product-id
const filterProductKeys = async () => {
	// Get all keys which store in the cache
	const allKeys = nodeCache.keys();

	// Get all product id from the database
	const productId = await Product.find({}).lean().exec();
	// convert the product id to string
	const productIds = productId.map((id) => id._id.toString());

	const key = allKeys.filter((key) => {
		const productKeys = key.startsWith("product-");
		if (productKeys) {
			const id = key.split("-").pop();
			// 	match the product id with the keys and return the id
			const matched = productIds.find((pId) => pId === id);
			return matched;
		}
	});
	return key;
};

// * Node Cache Revalidate / Invalidate Cache

export const invalidateCache = async ({
	product,
	order,
	admin,
}: InvalidateCacheProps) => {
	try {
		if (product) {
			const productsKeys: string[] = [
				"admin-products",
				"latestProducts",
				"categories",
			];

			const filter = await filterProductKeys();
			const keys = [...productsKeys, ...filter];
			nodeCache.del(keys);
		}
		if (order) {
			const orderKeys: string[] = ["all-admin-orders"];

			nodeCache.del(orderKeys);
		}
		if (admin) {
		}
	} catch (error) {
		logger.error(`Error occurred in the cache: ${error}`);
	}
};
