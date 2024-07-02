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
				"product",
			];
			const productId = await Product.find({}).select("_id");
			productId.forEach((id) => {
				productsKeys.push(`product-${id}`);
			});
			nodeCache.del(productsKeys);
		}
		if (order) {
		}
		if (admin) {
		}
	} catch (error) {
		logger.error(`Error occurred in the cache: ${error}`);
	}
};
