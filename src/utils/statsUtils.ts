import {Product} from "../models/productModel.js";
import ErrorHandler from "./utility-class.js";

export const getCategories = async ({
	categories,
	totalProducts,
	next,
}: {
	categories: string[];
	totalProducts: number;
	next: any;
}) => {
	try {
		const categoriesCountPromise = categories.map((category) =>
			Product.countDocuments({category}),
		);
		const categoriesCount = await Promise.all(categoriesCountPromise);

		const categoryCount: any[] = [];
		categories.forEach((category, index) => {
			categoryCount.push({
				[category]: Math.round(
					(categoriesCount[index] / totalProducts) * 100,
				),
			});
		});

		return categoryCount;
	} catch (e: any) {
		return next(new ErrorHandler(e.message, 500));
	}
};
