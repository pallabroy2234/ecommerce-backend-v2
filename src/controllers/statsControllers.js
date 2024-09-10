import { TryCatch } from "../middlewares/error.js";
import { nodeCache } from "../utils/nodeCache.js";
import { Product } from "../models/productModel.js";
import { UserModel } from "../models/userModel.js";
import { Order } from "../models/orderModel.js";
import { calculatePercentage } from "../utils/calculatePercentage.js";
import { getCategories, getDataByMonth } from "../utils/statsUtils.js";
/**
 * @description     Handles Get Dashboard stats
 * @route           POST /api/v1/dashboard/stats
 * @access          Private/Admin
 */
export const handleGetDashboardStats = TryCatch(async (req, res, next) => {
    let stats = {};
    const key = "admin-stats";
    if (nodeCache.has(key)) {
        stats = JSON.parse(nodeCache.get(key));
    }
    else {
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
        }).sort({ createdAt: -1 });
        const lastMonthProductsPromise = Product.find({
            createdAt: {
                $gt: lastMonth.start,
                $lte: lastMonth.end,
            },
        }).sort({ createdAt: -1 });
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
            .select(["discount", "total", "status", "createdAt", "orderItems"])
            .sort({ createdAt: -1 });
        const [thisMonthProducts, lastMonthProducts, thisMonthUsers, lastMonthUsers, thisMonthOrders, lastMonthOrders, lastSixMonthOrders, totalProducts, totalUsers, allOrder, categories, totalFemale, totalMale, latestTransactions,] = await Promise.all([
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
            UserModel.countDocuments({ gender: "female" }),
            UserModel.countDocuments({ gender: "male" }),
            latestTransactionsPromise,
        ]);
        // * Revenue
        const thisMonthRevenue = thisMonthOrders.reduce((total, order) => total + (order.total || 0), 0);
        const lastMonthRevenue = lastMonthOrders.reduce((total, order) => total + (order.total || 0), 0);
        // 	* percentage
        const percentage = {
            revenue: calculatePercentage(thisMonthRevenue, lastMonthRevenue),
            product: calculatePercentage(thisMonthProducts.length, lastMonthProducts.length),
            user: calculatePercentage(thisMonthUsers.length, lastMonthUsers.length),
            order: calculatePercentage(thisMonthOrders.length, lastMonthOrders.length),
        };
        // * Total Revenue
        const revenue = allOrder.reduce((acc, order) => acc + (order.total || 0), 0);
        const orderMonthCounts = new Array(6).fill(0);
        const orderMonthRevenue = new Array(6).fill(0);
        lastSixMonthOrders.forEach((order) => {
            const creationDate = order.createdAt;
            const yearDiff = today.getFullYear() - creationDate.getFullYear();
            const monthDiff = yearDiff * 12 + (today.getMonth() - creationDate.getMonth());
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
        // 	* Set Cache
        nodeCache.set(key, JSON.stringify(stats));
    }
    return res.status(200).json({
        success: true,
        message: "Successfully get dashboard stats",
        payload: stats,
    });
});
/**
 * @description     Handles Get Dashboard Pie Charts Data
 * @route           POST /api/v1/dashboard/pie
 * @access          Private/Admin
 */
export const handleGetPieChartsData = TryCatch(async (req, res, next) => {
    let charts = {};
    const key = "admin-pie-charts";
    if (nodeCache.has(key)) {
        charts = JSON.parse(nodeCache.get(key));
    }
    else {
        const allOrderPromise = Order.find({}).select(["total", "discount", "subtotal", "tax", "shippingCharges"]);
        const [processingOrder, shippedOrder, deliveredOrder, cancelledOrder, categories, totalProducts, productInStock, allOrders, allUsers, admins, users,] = await Promise.all([
            Order.countDocuments({ status: "processing" }),
            Order.countDocuments({ status: "shipped" }),
            Order.countDocuments({ status: "delivered" }),
            Order.countDocuments({ status: "cancelled" }),
            Product.distinct("category"),
            Product.countDocuments(),
            Product.countDocuments({ stock: { $gt: 0 } }),
            allOrderPromise,
            UserModel.find({}).select(["dob"]),
            UserModel.countDocuments({ role: "admin" }),
            UserModel.countDocuments({ role: "user" }),
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
        // * Revenue
        const grossIncome = allOrders.reduce((acc, order) => {
            return acc + (order.total || 0);
        }, 0);
        const discount = allOrders.reduce((acc, order) => {
            return acc + (order.discount || 0);
        }, 0);
        const productionCost = allOrders.reduce((acc, order) => {
            return acc + (order.shippingCharges || 0);
        }, 0);
        const burnt = allOrders.reduce((acc, order) => {
            return acc + (order.tax || 0);
        }, 0);
        const marketingCost = Math.round(grossIncome * (30 / 100));
        const netMargin = grossIncome - discount - productionCost - marketingCost - burnt;
        const revenueDistribution = {
            netMargin,
            discount,
            productionCost,
            burnt,
            marketingCost,
        };
        // * User Distribution
        const adminUser = {
            admins: admins,
            users: users,
        };
        // * Age Distribution
        const userAgeGroup = {
            teen: allUsers.filter((user) => user.age < 20).length,
            adult: allUsers.filter((user) => user.age >= 20 && user.age < 40).length,
            old: allUsers.filter((user) => user.age >= 40).length,
        };
        charts = {
            orderFullFill: orderFullFill || {},
            categoryPercentage: categoryPercentage || [],
            stockAvailability: stockAvailability || {},
            revenueDistribution: revenueDistribution || {},
            adminUser: adminUser || {},
            userAgeGroup: userAgeGroup || {},
        };
        // 	* Set Cache
        nodeCache.set(key, JSON.stringify(charts));
    }
    return res.status(200).json({
        success: true,
        message: "Successfully get pie charts data",
        payload: charts,
    });
});
/**
 * @description     Handles Get Dashboard Bar Charts Data
 * @route           POST /api/v1/dashboard/bar
 * @access          Private/Admin
 */
export const handleGetBarChartsData = TryCatch(async (req, res, next) => {
    let barCharts = {};
    const key = "admin-bar-charts";
    if (nodeCache.has(key)) {
        barCharts = JSON.parse(nodeCache.get(key));
    }
    else {
        // 	* Date
        const today = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
        // 	* Promise
        const sixMonthProductsPromise = Product.find({
            createdAt: {
                $gte: sixMonthsAgo,
                $lte: today,
            },
        }).select("createdAt");
        const sixMonthUsersPromise = UserModel.find({
            createdAt: {
                $gte: sixMonthsAgo,
                $lte: today,
            },
        }).select("createdAt");
        const twelveMonthOrdersPromise = Order.find({
            createdAt: {
                $gte: twelveMonthsAgo,
                $lte: today,
            },
        }).select("createdAt");
        // 	* Promise all
        const [sixMonthProducts, sixMonthUsers, twelveMonthOrders] = await Promise.all([
            sixMonthProductsPromise,
            sixMonthUsersPromise,
            twelveMonthOrdersPromise,
        ]);
        // * Month wise data
        const productCount = getDataByMonth({
            length: 6,
            today,
            docArray: sixMonthProducts,
        });
        const userCount = getDataByMonth({
            length: 6,
            today,
            docArray: sixMonthUsers,
        });
        const orderCount = getDataByMonth({
            length: 12,
            today,
            docArray: twelveMonthOrders,
        });
        // 		* Bar Chart Data
        barCharts = {
            productCount: productCount || [],
            userCount: userCount || [],
            orderCount: orderCount || [],
        };
        // 	* Set Cache
        nodeCache.set(key, JSON.stringify(barCharts));
    }
    return res.status(200).json({
        success: true,
        message: "Successfully get bar charts data",
        payload: barCharts,
    });
});
/**
 * @description     Handles Get Dashboard Line Charts Data
 * @route           POST /api/v1/dashboard/line
 * @access          Private/Admin
 */
export const handleGetLineChartsData = TryCatch(async (req, res, next) => {
    let barCharts = {};
    const key = "admin-line-charts";
    if (nodeCache.has(key)) {
        barCharts = JSON.parse(nodeCache.get(key));
    }
    else {
        // 	* Date
        const today = new Date();
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
        const baseQuery = {
            createdAt: {
                $gte: twelveMonthsAgo,
                $lte: today,
            },
        };
        // 	* Promise
        const twelveMonthOrdersPromise = Order.find(baseQuery).select(["createdAt", "total", "discount"]);
        const twelveMonthProductsPromise = Product.find(baseQuery).select("createdAt");
        const twelveMonthUsersPromise = UserModel.find(baseQuery).select("createdAt");
        // 	* Promise all
        const [twelveMonthOrders, twelveMonthProducts, twelveMonthUsers] = await Promise.all([
            twelveMonthOrdersPromise,
            twelveMonthProductsPromise,
            twelveMonthUsersPromise,
        ]);
        // * Month wise data
        const discount = getDataByMonth({
            length: 12,
            today,
            docArray: twelveMonthOrders,
            property: "discount",
        });
        const revenue = getDataByMonth({
            length: 12,
            today,
            docArray: twelveMonthOrders,
            property: "total",
        });
        const productCount = getDataByMonth({
            length: 12,
            today,
            docArray: twelveMonthProducts,
        });
        const userCount = getDataByMonth({
            length: 12,
            today,
            docArray: twelveMonthUsers,
        });
        // 		* Bar Chart Data
        barCharts = {
            discount,
            revenue,
            users: userCount,
            products: productCount,
        };
        // 	* Set Cache
        nodeCache.set(key, JSON.stringify(barCharts));
    }
    return res.status(200).json({
        success: true,
        message: "Successfully get bar charts data",
        payload: barCharts,
    });
});
