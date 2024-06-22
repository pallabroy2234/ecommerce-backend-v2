import express from "express";
import {
	handleGetAllAdminProducts,
	handleGetAllCategories,
	handleGetLatestProducts,
	handleGetSingleProduct,
	handleNewProduct,
	handleUpdateSingleProduct,
} from "../controllers/productControllers.js";
import {singleUpload} from "../middlewares/multer.js";
import {
	validateProduct,
	validateSingleProduct,
	validateUpdateProduct,
} from "../validators/validateProduct.js";
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

// * Get All Products Route -> /api/v1/product/admin-products
productRouter.get("/admin-products", isAdmin, handleGetAllAdminProducts);

// * Get Single Product Route -> /api/v1/product/:id
productRouter.get(
	"/:id",
	validateSingleProduct,
	runValidation(400),
	handleGetSingleProduct,
);

// * Update Single Product Route -> /api/v1/Product/:id
productRouter.put(
	"/:id",
	singleUpload,
	validateUpdateProduct,
	runValidation(422),
	handleUpdateSingleProduct,
);

export default productRouter;
