import express from "express";
import {handleNewOrder} from "../controllers/orderControllers.js";
import {validateNewOrder} from "../validators/validateOrder.js";
import {runValidation} from "../validators/index.js";

const orderRouter = express.Router();

//  * New Order Route -> /api/v1/order/new
orderRouter.post("/new", handleNewOrder);

export default orderRouter;
