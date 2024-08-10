import {TryCatch} from "../middlewares/error.js";
import {Request, Response, NextFunction} from "express";
import {nodeCache} from "../utils/nodeCache.js";
import {Product} from "../models/productModel.js";
import {UserModel} from "../models/userModel.js";
import {Order} from "../models/orderModel.js";
import {calculatePercentage} from "../utils/calculatePercentage.js";
import {tr} from "@faker-js/faker";
import {getCategories} from "../utils/statsUtils.js";
import ErrorHandler from "../utils/utility-class.js";

/**
 * @description     Handles Get Dashboard stats
 * @route           POST /api/v1/dashboard/stats
 * @access          Private/Admin
 */

export const handleGetDashboardStats = TryCatch(
	async (req: Request, res: Response, next: NextFunction) => {
		let stats = {};
		const key = "admin-stats";
		if (nodeCache.has(key)) {
			stats = JSON.parse(nodeCache.get(key) as string);
		} else {
			// * Date
			const today = new Date();
			const sixMonthsAgo = new Date();
			sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
			const thisMonth = {
				start: new Date(today.getFullYear(), today.getMonth(), 1),
				end: today,
			};
			const lastMonth = {
				start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
				end: new Date(today.getFullYear(), today.getMonth(), 0),
			};

			// * Product
			const thisMonthProductsPromise = Product.find({
				createdAt: {
					$gt: thisMonth.start,
					$lte: thisMonth.end,
				},
			}).sort({createdAt: -1});
			const lastMonthProductsPromise = Product.find({
				createdAt: {
					$gt: lastMonth.start,
					$lte: lastMonth.end,
				},
			}).sort({createdAt: -1});

			//  * User
			const thisMonthUsersPromise = UserModel.find({
				createdAt: {
					$gte: thisMonth.start,
					$lte: thisMonth.end,
				},
			});
			const lastMonthUsersPromise = UserModel.find({
				createdAt: {
					$gte: lastMonth.start,
					$lte: lastMonth.end,
				},
			});

			// 	* Order
			const thisMonthOrdersPromise = Order.find({
				createdAt: {
					$gte: thisMonth.start,
					$lte: thisMonth.end,
				},
			});
			const lastMonthOrdersPromise = Order.find({
				createdAt: {
					$gte: lastMonth.start,
					$lte: lastMonth.end,
				},
			});
			const lastSixMonthOrdersPromise = Order.find({
				createdAt: {
					$gte: sixMonthsAgo,
					$lte: today,
				},
			});

			// * Latest four transactions
			const latestTransactionsPromise = Order.find({})
				.limit(4)
				.select(["discount", "total", "status", "createdAt"])
				.sort({createdAt: -1});

			const [
				thisMonthProducts,
				lastMonthProducts,
				thisMonthUsers,
				lastMonthUsers,
				thisMonthOrders,
				lastMonthOrders,
				lastSixMonthOrders,
				totalProducts,
				totalUsers,
				allOrder,
				categories,
				totalFemale,
				totalMale,
				latestTransactions,
			] = await Promise.all([
				thisMonthProductsPromise,
				lastMonthProductsPromise,
				thisMonthUsersPromise,
				lastMonthUsersPromise,
				thisMonthOrdersPromise,
				lastMonthOrdersPromise,
				lastSixMonthOrdersPromise,
				Product.countDocuments(),
				UserModel.countDocuments(),
				Order.find({}).select("total"),
				Product.distinct("category"),
				UserModel.countDocuments({gender: "female"}),
				UserModel.countDocuments({gender: "male"}),
				latestTransactionsPromise,
			]);

			// * Revenue
			const thisMonthRevenue = thisMonthOrders.reduce(
				(total, order) => total + (order.total || 0),
				0,
			);
			const lastMonthRevenue = lastMonthOrders.reduce(
				(total, order) => total + (order.total || 0),
				0,
			);

			// 	* percentage
			const percentage = {
				revenue: calculatePercentage(
					thisMonthRevenue,
					lastMonthRevenue,
				),
				product: calculatePercentage(
					thisMonthProducts.length,
					lastMonthProducts.length,
				),
				user: calculatePercentage(
					thisMonthUsers.length,
					lastMonthUsers.length,
				),
				order: calculatePercentage(
					thisMonthOrders.length,
					lastMonthOrders.length,
				),
			};

			// * Total Revenue
			const revenue = allOrder.reduce(
				(acc, order) => acc + (order.total || 0),
				0,
			);
			const orderMonthCounts = new Array(6).fill(0);
			const orderMonthRevenue = new Array(6).fill(0);
			lastSixMonthOrders.forEach((order) => {
				const creationDate = order.createdAt;
				const yearDiff =
					today.getFullYear() - creationDate.getFullYear();
				const monthDiff =
					yearDiff * 12 +
					(today.getMonth() - creationDate.getMonth());

				if (monthDiff < 6) {
					orderMonthCounts[6 - monthDiff - 1] += 1;
					orderMonthRevenue[6 - monthDiff - 1] += order.total || 0;
				}
			});

			// * Percentage of each category
			const categoryCount = await getCategories({
				categories,
				totalProducts,
				next,
			});
			if (categoryCount instanceof Error) {
				return next(categoryCount);
			}

			// * Gender Ratio
			const userRatio = {
				female: totalFemale,
				male: totalMale,
				other: totalUsers - totalFemale - totalMale,
			};

			// * count
			const count = {
				totalRevenue: revenue,
				totalProducts,
				totalUsers,
				totalOrders: allOrder.length,
			};

			stats = {
				categoryCount: categoryCount || [],
				percentage: percentage || {},
				count: count || {},
				chart: {
					orderMonthCounts: orderMonthCounts || {},
					orderMonthRevenue: orderMonthRevenue || {},
				},
				userRatio: userRatio || {},
				latestTransactions: latestTransactions || [],
			};

			// 	* Invalid Cache
			nodeCache.set(key, JSON.stringify(stats));
		}

		return res.status(200).json({
			success: true,
			message: "Successfully get dashboard stats",
			payload: stats,
		});
	},
);

/**
 * @description     Handles Get Dashboard Pie Charts Data
 * @route           POST /api/v1/dashboard/pie
 * @access          Private/Admin
 */
export const handleGetPieChartsData = TryCatch(
	async (req: Request, res: Response, next: NextFunction) => {
		let charts = {};
		const key = "admin-pie-charts";

		if (nodeCache.has(key)) {
			charts = JSON.parse(nodeCache.get(key) as string);
		} else {
			const [
				processingOrder,
				shippedOrder,
				deliveredOrder,
				cancelledOrder,
				categories,
				totalProducts,
				productInStock,
			] = await Promise.all([
				Order.countDocuments({status: "processing"}),
				Order.countDocuments({status: "shipped"}),
				Order.countDocuments({status: "delivered"}),
				Order.countDocuments({status: "cancelled"}),
				Product.distinct("category"),
				Product.countDocuments(),
				Product.countDocuments({stock: {$gt: 0}}),
			]);

			// 	* order FullFill
			const orderFullFill = {
				processing: processingOrder,
				shipped: shippedOrder,
				delivered: deliveredOrder,
				cancelled: cancelledOrder,
			};

			// * Percentage of each category
			const categoryPercentage = await getCategories({
				categories,
				totalProducts,
				next,
			});
			if (categoryPercentage instanceof Error) {
				return next(categoryPercentage);
			}

			// * Stock Availability
			const stockAvailability = {
				inStock: productInStock,
				outOfStock: totalProducts - productInStock,
			};

			charts = {
				orderFullFill: orderFullFill || {},
				categoryPercentage: categoryPercentage || [],
				stockAvailability: stockAvailability || {},
			};

			// 	* Set Cache
			nodeCache.set(key, JSON.stringify(charts));
		}

		return res.status(200).json({
			success: true,
			message: "Successfully get pie charts data",
			payload: charts,
		});
	},
);

export const handleGetBarChartsData = TryCatch(
	async (req: Request, res: Response, next: NextFunction) => {},
);

export const handleGetLineChartsData = TryCatch(
	async (req: Request, res: Response, next: NextFunction) => {},
);
