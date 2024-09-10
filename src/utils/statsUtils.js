import { Product } from "../models/productModel.js";
import ErrorHandler from "./utility-class.js";
export const getCategories = async ({ categories, totalProducts, next, }) => {
    try {
        const categoriesCountPromise = categories.map((category) => Product.countDocuments({ category }));
        const categoriesCount = await Promise.all(categoriesCountPromise);
        const categoryCount = [];
        categories.forEach((category, index) => {
            categoryCount.push({
                [category]: Math.round((categoriesCount[index] / totalProducts) * 100),
            });
        });
        return categoryCount;
    }
    catch (e) {
        return next(new ErrorHandler(e.message, 500));
    }
};
export const getDataByMonth = ({ length, today, docArray, property }) => {
    const data = new Array(length).fill(0);
    docArray.forEach((item) => {
        const creationDate = item.createdAt;
        const yearDiff = today.getFullYear() - creationDate.getFullYear();
        const monthDiff = yearDiff * 12 + (today.getMonth() - creationDate.getMonth());
        if (monthDiff < length) {
            if (property) {
                data[length - monthDiff - 1] += item[property] ?? 0;
            }
            else {
                data[length - monthDiff - 1] += 1;
            }
        }
    });
    return data;
};
