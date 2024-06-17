import {Request, Response, NextFunction} from "express";
import {TryCatch} from "../middlewares/error.js";

import {Product} from "../models/productModel.js";
import {NewProductRequestBody} from "../types/types.js";

// * Create New Product handler ->  /api/v1/product/new
export const handleNewProduct = TryCatch(
	async (
		req: Request<{}, {}, NewProductRequestBody>,
		res: Response,
		next: NextFunction,
	) => {
		const {name, category, price, stock} = req.body;

		const image = req.file;

		const newProduct = await Product.create({
			name,
			image: image?.path,
			category,
			price,
			stock,
		});

		return res.status(201).json({
			success: true,
			message: "Product created successfully",
			payload: newProduct,
		});
	},
);

// * Get latest Product handler -> /api/v1/product/latest

export const handleGetLatestProducts = TryCatch(
	async (req: Request, res: Response, next: NextFunction) => {
		const products = await Product.find({}).sort({createdAt: -1}).limit(5);

		return res.status(products.length > 0 ? 200 : 404).json({
			success: products.length > 0 ? true : false,
			message:
				products.length > 0 ? "Latest products" : "No products found",
			payload: products.length > 0 ? products : [],
		});
	},
);

// * Get all Categories handler -> /api/v1/product/categories
export const handleGetAllCategories = TryCatch(
	async (req: Request, res: Response, next: NextFunction) => {
		const categories = await Product.distinct("category");

		return res.status(categories.length > 0 ? 200 : 404).json({
			success: categories.length > 0 ? true : false,
			message:
				categories.length > 0
					? "All available categories"
					: "No categories found",
			payload: categories.length > 0 ? categories : [],
		});
	},
);
