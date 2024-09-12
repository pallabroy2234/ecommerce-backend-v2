import {Request, Response, NextFunction} from "express";
import {TryCatch} from "../middlewares/error.js";
import {Product} from "../models/productModel.js";
import {BaseQuery, NewProductRequestBody, ProductUpdateRequestBody, SearchQueryParams} from "../types/types.js";
import ErrorHandler from "../utils/utility-class.js";
import {deleteImage} from "../validators/index.js";
import {validateAllowedFields} from "../utils/allowedFields.js";
import {validateAllowedQueryParams} from "../utils/allowedQueryParams.js";
import {escapeRegex} from "../utils/escapeRegex.js";
import {invalidateCache, nodeCache} from "../utils/nodeCache.js";
import {v2 as cloudinary} from "cloudinary";
import {deleteImageFromCloudinary, publicIdWithOutExtensionFromUrl} from "../utils/cloudinary-utility.js";
import mongoose from "mongoose";

// * Create New Product handler ->  /api/v1/product/new
export const handleNewProduct = TryCatch(
	async (req: Request<{}, {}, NewProductRequestBody>, res: Response, next: NextFunction) => {
		const {name, category, price, stock} = req.body;

		//  list of allowed fields

		const image = req.file;

		// ! Check for any field that are not allowed
		const allowedFields: (keyof NewProductRequestBody)[] = ["name", "category", "price", "stock", "image"];

		const invalidFields = validateAllowedFields(req, allowedFields);
		if (invalidFields) {
			return next(new ErrorHandler(`Invalid fields: ${invalidFields.join(", ")}`, 400));
		}

		let imageUrl = "";
		if (image) {
			try {
				const result = await cloudinary.uploader.upload(image.path, {
					folder: "ecommerce-v2/products",
				});
				imageUrl = result.secure_url;
				// 	delete Image after upload to cloudinary
				deleteImage(image.path);
			} catch (err: any) {
				return next(new ErrorHandler("Failed to upload image", 500));
			}
		}

		const newProduct = await Product.create({
			name,
			image: imageUrl,
			category,
			price,
			stock,
		});

		// * Invalidate the cache
		invalidateCache({product: true, admin: true});

		return res.status(201).json({
			success: true,
			message: "Product created successfully",
			payload: newProduct,
		});
	},
);

// * Get latest Product handler -> /api/v1/product/latest || Revalidate on New, Update, Delete products and New Order

export const handleGetLatestProducts = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
	// * Get the latest products from the cache
	let products = [];

	if (nodeCache.has("latestProducts")) {
		products = JSON.parse(nodeCache.get("latestProducts") as string);
	} else {
		products = await Product.find({}).sort({createdAt: -1}).limit(5);
		// * Set the latest products in the cache
		nodeCache.set("latestProducts", JSON.stringify(products));
	}

	return res.status(200).json({
		success: true,
		message: "Latest products",
		payload: products || [],
	});
});

// * Get all Categories handler -> /api/v1/product/categories || Revalidate on New, Update, Delete products and New Order
export const handleGetAllCategories = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
	//  Get the categories from the cache
	let categories = [];

	if (nodeCache.has("categories")) {
		categories = JSON.parse(nodeCache.get("categories") as string);
	} else {
		categories = await Product.distinct("category");
		//  Set the categories in the cache
		nodeCache.set("categories", JSON.stringify(categories));
	}

	return res.status(200).json({
		success: true,
		message: "All available categories",
		payload: categories || [],
	});
});

// * Get Admin all Products handler -> /api/v1/product/admin-products || Revalidate on New, Update, Delete products and New Order

export const handleGetAllAdminProducts = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
	let products = [];

	// Get the products from the cache or database
	if (nodeCache.has("admin-products")) {
		products = JSON.parse(nodeCache.get("admin-products") as string);
	} else {
		products = await Product.find({}).sort({createdAt: -1});
		// Set the products in the cache
		nodeCache.set("admin-products", JSON.stringify(products));
	}

	return res.status(200).json({
		success: true,
		message: "Fetch all product",
		payload: products || [],
	});
});

// * Get Single Product handler -> /api/v1/product/:id || Revalidate on New, Update, Delete products and New Order

export const handleGetSingleProduct = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
	const {id} = req.params;

	let product;

	// Get the product from the cache or database
	if (nodeCache.has(`product-${id}`)) {
		product = JSON.parse(nodeCache.get(`product-${id}`) as string);
	} else {
		product = await Product.findById({_id: id});
		// Set the product in the cache
		nodeCache.set(`product-${id}`, JSON.stringify(product));
	}

	return res.status(product ? 200 : 404).json({
		success: !!product,
		message: product ? "Product found" : "Product not found",
		payload: product ? product : {},
	});
});

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
			throw new ErrorHandler(`Field ${key} is not allowed for update`, 400);
		}
	}
	return updates;
};

export const handleUpdateSingleProduct = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
	const {id} = req.params;
	const image = req.file;
	const productExists = await Product.findById({_id: id});
	if (!productExists) return next(new ErrorHandler("Product not found", 404));

	const allowFields: (keyof ProductUpdateRequestBody)[] = ["name", "category", "price", "stock", "image"];

	// * Update allowed fields
	let updates: Partial<ProductUpdateRequestBody> = prepareUpdates(req.body, allowFields);

	if (image) {
		try {
			if (productExists.image) {
				const publicId = publicIdWithOutExtensionFromUrl(productExists.image);
				const deleteImage = await deleteImageFromCloudinary("ecommerce-v2/products", publicId);
				if (deleteImage instanceof Error) {
					return next(deleteImage);
				}
			}
			const result = await cloudinary.uploader.upload(image.path, {
				folder: "ecommerce-v2/products",
			});
			updates.image = result.secure_url;
			// 	delete Image after upload to cloudinary
			deleteImage(image.path);
		} catch (err: any) {
			return next(new ErrorHandler("Failed to upload image", 500));
		}
	}

	const updatedProduct = await Product.findByIdAndUpdate({_id: id}, updates, {
		new: true,
		runValidators: true,
		context: "query",
	});

	if (!updatedProduct) return next(new ErrorHandler("Error updating product", 404));

	invalidateCache({
		product: true,
		productId: String(updatedProduct._id),
		admin: true,
	});

	return res.status(200).json({
		success: true,
		message: "Product updated successfully",
	});
});

// * Delete Single Product handler -> /api/v1/product/:id
export const handleDeleteProduct = TryCatch(async (req: Request, res: Response, next: NextFunction) => {
	const {id} = req.params;

	const productExists = await Product.findById({_id: id});
	if (!productExists) return next(new ErrorHandler("Product not found", 404));
	const publicId = publicIdWithOutExtensionFromUrl(productExists.image);
	const [deletedProduct, deleteImage] = await Promise.all([
		Product.findByIdAndDelete({_id: id}),
		deleteImageFromCloudinary("ecommerce-v2/products", publicId),
	]);

	if (!deletedProduct) return next(new ErrorHandler("Error deleting product", 404));
	if (deleteImage instanceof Error) {
		await Product.create({
			...productExists.toObject(),
		});
		return next(deleteImage);
	}

	//  Invalidate the cache
	invalidateCache({
		product: true,
		productId: String(deletedProduct._id),
		admin: true,
	});

	return res.status(200).json({
		success: true,
		message: "Product deleted successfully",
	});
});

//* Get all products with filter handler -> /api/v1/product/all

export const handleGetAllProducts = TryCatch(
	async (req: Request<{}, {}, {}, SearchQueryParams>, res: Response, next: NextFunction) => {
		const {search, price, category, sort} = req.query;
		const page = Number(req.query.page) || 1;
		const limit = Number(process.env.PRODUCTS_LIMIT) || 8;
		const skip = (page - 1) * limit;
		const searchPattern: RegExp = escapeRegex(search || "");

		// list of allowed queries
		const allowQueries: (keyof SearchQueryParams)[] = ["search", "price", "category", "sort", "page"];
		// 	! Check for any query that are not allowed
		const invalidQueries = validateAllowedQueryParams(req, allowQueries);
		if (invalidQueries) {
			return next(new ErrorHandler(`Invalid queries: ${invalidQueries.join(", ")}`, 400));
		}

		// Base query
		const baseQuery: BaseQuery = {};
		if (search) baseQuery.name = {$regex: searchPattern};
		if (price) baseQuery.price = {$lte: Number(price)};
		if (category) baseQuery.category = category;

		const productPromise = Product.find(baseQuery)
			.sort(sort && {price: sort === "asc" ? 1 : -1})
			.limit(limit)
			.skip(skip);

		const [products, totalProducts] = await Promise.all([productPromise, Product.countDocuments(baseQuery)]);

		return res.status(200).json({
			success: true,
			message: "All products",
			payload: products || [],
			pagination: {
				totalNumberOfProducts: totalProducts,
				totalPages: Math.ceil(totalProducts / limit),
				currentPage: page,
				previousPage: page - 1 ? page - 1 : null,
				nextPage: page + 1 <= Math.ceil(totalProducts / limit) ? page + 1 : null,
			},
			link: {
				previous: page - 1 ? `/product/all?page=${page - 1}` : null,
				next: page + 1 <= Math.ceil(totalProducts / limit) ? `/product/all?page=${page + 1}` : null,
			},
		});
	},
);
