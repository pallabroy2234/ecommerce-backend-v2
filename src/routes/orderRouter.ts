import express from "express";
import {handleNewOrder} from "../controllers/orderControllers.js";

const orderRouter = express.Router();

orderRouter.post("/new", handleNewOrder);

export default orderRouter;
