import express from "express";
import {handleNewProduct} from "../controllers/productControllers.js";

const productRouter = express.Router();

productRouter.post("/new", handleNewProduct);

export default productRouter;
