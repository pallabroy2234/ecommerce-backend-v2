import {TryCatch} from "../middlewares/error.js";
import {Request, Response, NextFunction} from "express";
import {nodeCache} from "../utils/nodeCache.js";
import {Product} from "../models/productModel.js";
import {UserModel} from "../models/userModel.js";
import {Order} from "../models/orderModel.js";
import {calculatePercentage} from "../utils/calculatePercentage.js";

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

			// * count
			const count = {
				revenue: revenue,
				product: totalProducts,
				user: totalUsers,
				order: allOrder.length,
			};

			stats = {
				percentage,
				count,
				chart: {
					orderMonthCounts,
					orderMonthRevenue,
				},
			};
		}

		return res.status(200).json({
			success: true,
			message: "Successfully get dashboard stats",
			payload: stats,
		});
	},
);

export const handleGetPieChartsData = TryCatch(
	async (req: Request, res: Response, next: NextFunction) => {},
);

export const handleGetBarChartsData = TryCatch(
	async (req: Request, res: Response, next: NextFunction) => {},
);

export const handleGetLineChartsData = TryCatch(
	async (req: Request, res: Response, next: NextFunction) => {},
);
