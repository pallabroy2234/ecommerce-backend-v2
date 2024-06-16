import express from "express";
import {handleNewProduct} from "../controllers/productControllers.js";
import {singleUpload} from "../middlewares/multer.js";
import {validateProduct} from "../validators/validateProduct.js";
import {runValidation} from "../validators/index.js";
import {isAdmin} from "../middlewares/auth.js";

const productRouter = express.Router();

productRouter.post(
	"/new",
	isAdmin,
	singleUpload,
	validateProduct,
	runValidation(),
	handleNewProduct,
);

export default productRouter;
