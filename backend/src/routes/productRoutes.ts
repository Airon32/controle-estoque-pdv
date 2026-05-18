import { Router } from "express";
import multer from "multer";
import {
  createProductHandler,
  deleteProductHandler,
  getProductById,
  getProducts,
  updateProductHandler
} from "../controllers/productController";
import { importProductsHandler } from "../controllers/importController";

const productRoutes = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

productRoutes.get("/", getProducts);
productRoutes.post("/import", upload.single("file"), importProductsHandler);
productRoutes.get("/:id", getProductById);
productRoutes.post("/", createProductHandler);
productRoutes.put("/:id", updateProductHandler);
productRoutes.delete("/:id", deleteProductHandler);

export { productRoutes };
