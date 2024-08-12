import {Product} from "../models/productModel.js";
import ErrorHandler from "./utility-class.js";
import {Document} from "mongoose";

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

interface MYDocument extends Document {
	createdAt: Date;
}

type getDataByMonthType = {
	length: number;
	today: Date;
	docArray: MYDocument[];
};
export const getDataByMonth = ({
	length,
	today,
	docArray,
}: getDataByMonthType) => {
	const data: number[] = new Array(length).fill(0);
	docArray.forEach((item) => {
		const creationDate = item.createdAt;
		const yearDiff = today.getFullYear() - creationDate.getFullYear();
		const monthDiff =
			yearDiff * 12 + (today.getMonth() - creationDate.getMonth());

		if (monthDiff < length) {
			data[length - monthDiff - 1] += 1;
		}
	});
	return data;
};
