import express from "express";
import {
	handleGetAllOrders,
	handleGetOrderDetails,
	handleNewOrder,
	handlerMyOrders,
} from "../controllers/orderControllers.js";
import {
	validateMyOrders,
	validateNewOrder,
	validateOrderDetails,
} from "../validators/validateOrder.js";
import {runValidation} from "../validators/index.js";
import {isAdmin} from "../middlewares/auth.js";

const orderRouter = express.Router();

//  * New Order Route -> /api/v1/order/new
orderRouter.post("/new", validateNewOrder, runValidation(422), handleNewOrder);

// * Get my orders[users order] -> /api/v1/order/myOrders
orderRouter.get(
	"/myOrders",
	validateMyOrders,
	runValidation(422),
	handlerMyOrders,
);

// * Get all orders[admin] -> /api/v1/order/all

orderRouter.get("/all", isAdmin, handleGetAllOrders);

// * Get Order details -> /api/v1/order/:id

orderRouter.get(
	"/:id",
	validateOrderDetails,
	runValidation(422),
	handleGetOrderDetails,
);

export default orderRouter;
