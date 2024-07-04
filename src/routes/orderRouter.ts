import express from "express";
import {handleNewOrder} from "../controllers/orderControllers.js";

const orderRouter = express.Router();

//  * New Order Route -> /api/v1/order/new
orderRouter.post("/new", handleNewOrder);

export default orderRouter;
