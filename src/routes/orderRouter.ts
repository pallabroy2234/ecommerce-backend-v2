import express from "express";
import {
	handleGetAllOrders,
	handleNewOrder,
	handlerMyOrders,
} from "../controllers/orderControllers.js";
import {
	validateMyOrders,
	validateNewOrder,
} from "../validators/validateOrder.js";
import {runValidation} from "../validators/index.js";
import {isAdmin} from "../middlewares/auth.js";

const orderRouter = express.Router();

//  * New Order Route -> /api/v1/order/new
orderRouter.post("/new", validateNewOrder, runValidation(422), handleNewOrder);

// * Get my orders[users order] -> /api/v1/orders/myOrders
orderRouter.get(
	"/myOrders",
	validateMyOrders,
	runValidation(422),
	handlerMyOrders,
);

// * Get all orders[admin] -> /api/v1/orders

orderRouter.get("/all", isAdmin, handleGetAllOrders);

export default orderRouter;
