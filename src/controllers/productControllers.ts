import {Request, Response, NextFunction} from "express";
import {TryCatch} from "../middlewares/error.js";

import {Product} from "../models/productModel.js";
import {NewProductRequestBody} from "../types/types.js";

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
