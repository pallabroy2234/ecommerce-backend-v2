import express from "express";
import {
	handleGetAllCategories,
	handleGetLatestProducts,
	handleNewProduct,
} from "../controllers/productControllers.js";
import {singleUpload} from "../middlewares/multer.js";
import {validateProduct} from "../validators/validateProduct.js";
import {runValidation} from "../validators/index.js";
import {isAdmin} from "../middlewares/auth.js";

const productRouter = express.Router();

// * Create New Product Route -> /api/v1/product/new
productRouter.post(
	"/new",
	// isAdmin,
	singleUpload,
	validateProduct,
	runValidation(),
	handleNewProduct,
);

// * Get latest products Route -> /api/v1/product/latest
productRouter.get("/latest", handleGetLatestProducts);

// * Get all categories Route -> /api/v1/product/categories
productRouter.get("/categories", handleGetAllCategories);
export default productRouter;
