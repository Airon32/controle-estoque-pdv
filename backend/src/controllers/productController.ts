import { Request, Response } from "express";
import { z } from "zod";
import {
  createProduct,
  deleteProduct,
  listProducts,
  updateProduct
} from "../services/productService";
import { productSchema } from "../validators/product-validator";
import { HttpError } from "../utils/http-error";

const paramsSchema = z.object({
  id: z.coerce.number().int().positive()
});

export const getProducts = async (_request: Request, response: Response) => {
  const products = await listProducts();

  return response.status(200).json(products);
};

export const createProductHandler = async (
  request: Request,
  response: Response
) => {
  const payload = productSchema.parse(request.body);
  const product = await createProduct(payload);

  return response.status(201).json(product);
};

export const updateProductHandler = async (
  request: Request,
  response: Response
) => {
  const { id } = paramsSchema.parse(request.params);
  const payload = productSchema.parse(request.body);
  const product = await updateProduct(id, payload);

  return response.status(200).json(product);
};

export const deleteProductHandler = async (
  request: Request,
  response: Response
) => {
  const { id } = paramsSchema.parse(request.params);
  await deleteProduct(id);

  return response.status(204).send();
};

export const getProductById = async (request: Request, response: Response) => {
  const { id } = paramsSchema.parse(request.params);
  const products = await listProducts();
  const product = products.find((item) => item.id === id);

  if (!product) {
    throw new HttpError(404, "Produto nao encontrado.");
  }

  return response.status(200).json(product);
};
