import express from "express";
import {handleNewProduct} from "../controllers/productControllers.js";
import {singleUpload} from "../middlewares/multer.js";

const productRouter = express.Router();

productRouter.post("/new", singleUpload, handleNewProduct);

export default productRouter;
