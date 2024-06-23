import {Request, Response, NextFunction} from "express";
import {TryCatch} from "../middlewares/error.js";

import {Product} from "../models/productModel.js";
import {
	NewProductRequestBody,
	ProductUpdateRequestBody,
} from "../types/types.js";
import ErrorHandler from "../utils/utility-class.js";
import {deleteImage} from "../validators/index.js";

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

// * Get Admin all Products handler -> /api/v1/product/admin-products

export const handleGetAllAdminProducts = TryCatch(
	async (req: Request, res: Response, next: NextFunction) => {
		const products = await Product.find({});

		return res.status(products.length > 0 ? 200 : 404).json({
			success: products.length > 0 ? true : false,
			message:
				products.length > 0 ? "Latest products" : "No products found",
			payload: products.length > 0 ? products : [],
		});
	},
);

// * Get Single Product handler -> /api/v1/product/:id

export const handleGetSingleProduct = TryCatch(
	async (req: Request, res: Response, next: NextFunction) => {
		const {id} = req.params;

		const product = await Product.findById({_id: id});

		return res.status(product ? 200 : 404).json({
			success: product ? true : false,
			message: product ? "Product found" : "Product not found",
			payload: product ? product : {},
		});
	},
);

// * Update Single Product handler -> /api/v1/product/:id

// ? Function to validate and prepare updates
const prepareUpdates = (
	body: any,
	allowedFields: (keyof ProductUpdateRequestBody)[],
): Partial<ProductUpdateRequestBody> => {
	let updates: Partial<ProductUpdateRequestBody> = {};
	for (let key in body) {
		if (allowedFields.includes(key as keyof ProductUpdateRequestBody)) {
			(updates as any)[key] = body[key as keyof ProductUpdateRequestBody];
		} else {
			throw new ErrorHandler(
				`Field ${key} is not allowed for update`,
				400,
			);
		}
	}
	return updates;
};

export const handleUpdateSingleProduct = TryCatch(
	async (req: Request, res: Response, next: NextFunction) => {
		const {id} = req.params;
		const image = req.file;
		const productExists = await Product.findById({_id: id});
		if (!productExists)
			return next(new ErrorHandler("Product not found", 404));

		const allowFields: (keyof ProductUpdateRequestBody)[] = [
			"name",
			"category",
			"price",
			"stock",
			"image",
		];

		// * Update allowed fields
		let updates: Partial<ProductUpdateRequestBody> = prepareUpdates(
			req.body,
			allowFields,
		);

		//  * Old image path delete and new image path update
		if (image) {
			if (productExists.image) {
				deleteImage(productExists.image);
			}
			updates.image = image.path;
		}

		const updatedProduct = await Product.findByIdAndUpdate(
			{_id: id},
			updates,
			{
				new: true,
				runValidators: true,
				context: "query",
			},
		);
		if (!updatedProduct)
			return next(new ErrorHandler("Error updating product", 404));

		return res.status(200).json({
			success: true,
			message: "Product updated successfully",
			payload: updatedProduct,
		});
	},
);

// * Delete Single Product handler -> /api/v1/product/:id
export const handleDeleteProduct = TryCatch(
	async (req: Request, res: Response, next: NextFunction) => {
		const {id} = req.params;

		const productExists = await Product.findById({_id: id});
		if (!productExists)
			return next(new ErrorHandler("Product not found", 404));

		if (productExists.image) {
			deleteImage(productExists.image);
		}

		const deletedProduct = await Product.findByIdAndDelete({_id: id});

		if (!deletedProduct)
			return next(new ErrorHandler("Error deleting product", 404));

		return res.status(200).json({
			success: true,
			message: "Product deleted successfully",
			payload: deletedProduct,
		});
	},
);
