import express from "express";
import {
	handleNewOrder,
	handlerMyOrders,
} from "../controllers/orderControllers.js";
import {validateNewOrder} from "../validators/validateOrder.js";
import {runValidation} from "../validators/index.js";

const orderRouter = express.Router();

//  * New Order Route -> /api/v1/order/new
orderRouter.post("/new", validateNewOrder, runValidation(422), handleNewOrder);

// * Get my orders -> /api/v1/orders/myOrders
orderRouter.get("/myOrders", handlerMyOrders);

export default orderRouter;
