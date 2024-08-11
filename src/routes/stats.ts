import express from "express";
import {
	handleGetBarChartsData,
	handleGetDashboardStats,
	handleGetLineChartsData,
	handleGetPieChartsData,
} from "../controllers/statsControllers.js";
import {isAdmin} from "../middlewares/auth.js";

const dashboardRouter = express.Router();

/**
 * @route      GET /api/v1/dashboard/stats
 * @desc       GET Dashboard Stats
 * @access     Private/Admin
 *
 * @handler    handleGetDashboardStats: Process to request get dashboard static Data
 */

dashboardRouter.get("/stats", isAdmin, handleGetDashboardStats);

/**
 * @route      GET /api/v1/dashboard/pie
 * @desc       GET Dashboard Pie Charts Data
 * @access     Private/Admin
 *
 * @handler    handleGetPieChartsData: Process to request get dashboard static Data for pie charts
 */
dashboardRouter.get("/pie", isAdmin, handleGetPieChartsData);

/**
 * @route      GET /api/v1/dashboard/bar
 * @desc       GET dashboard bar charts data
 * @access     Private/Admin
 *
 * @handler    handleGetBarChartsData: Process to request get dashboard static Data for bar charts
 * */
dashboardRouter.get("/bar", handleGetBarChartsData);

dashboardRouter.get("/line", handleGetLineChartsData);

export default dashboardRouter;
