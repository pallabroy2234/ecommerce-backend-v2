import express from "express";
import { handleDeleteProduct, handleGetAllAdminProducts, handleGetAllCategories, handleGetAllProducts, handleGetLatestProducts, handleGetSingleProduct, handleNewProduct, handleUpdateSingleProduct, } from "../controllers/productControllers.js";
import { singleUpload } from "../middlewares/multer.js";
import { validateDeleteProduct, validateGetAllProducts, validateProduct, validateSingleProduct, validateUpdateProduct, } from "../validators/validateProduct.js";
import { runValidation } from "../validators/index.js";
import { isAdmin } from "../middlewares/auth.js";
const productRouter = express.Router();
// * Create New Product Route -> /api/v1/product/new
productRouter.post("/new", isAdmin, singleUpload, validateProduct, runValidation(), handleNewProduct);
// * Get latest products Route -> /api/v1/product/latest
productRouter.get("/latest", handleGetLatestProducts);
// * Get all product route by search -> /api/v1/product/all
productRouter.get("/all", validateGetAllProducts, runValidation(422), handleGetAllProducts);
// * Get all categories Route -> /api/v1/product/categories
productRouter.get("/categories", handleGetAllCategories);
// * Get All Products With Filter Route -> /api/v1/product/admin-products
productRouter.get("/admin-products", isAdmin, handleGetAllAdminProducts);
// * Get Single Product Route -> /api/v1/product/:id
productRouter.get("/:id", validateSingleProduct, runValidation(400), handleGetSingleProduct);
// * Update Single Product Route -> /api/v1/product/:id
productRouter.put("/:id", isAdmin, singleUpload, validateUpdateProduct, runValidation(422), handleUpdateSingleProduct);
// * Delete Single Product Route -> /api/v1/product/:id
productRouter.delete("/:id", isAdmin, validateDeleteProduct, runValidation(400), handleDeleteProduct);
export default productRouter;
