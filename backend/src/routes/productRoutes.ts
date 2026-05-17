import { Router } from "express";
import {
  createProductHandler,
  deleteProductHandler,
  getProductById,
  getProducts,
  updateProductHandler
} from "../controllers/productController";

const productRoutes = Router();

productRoutes.get("/", getProducts);
productRoutes.get("/:id", getProductById);
productRoutes.post("/", createProductHandler);
productRoutes.put("/:id", updateProductHandler);
productRoutes.delete("/:id", deleteProductHandler);

export { productRoutes };
