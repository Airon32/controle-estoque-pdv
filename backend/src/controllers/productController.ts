import { Request, Response } from "express";
import { z } from "zod";
import {
  createProduct,
  deleteProduct,
  getProductById as getProductByIdService,
  listProductsByUser,
  updateProduct
} from "../services/productService";
import { productSchema } from "../validators/product-validator";

const paramsSchema = z.object({
  id: z.coerce.number().int().positive()
});

export const getProducts = async (request: Request, response: Response) => {
  const products = await listProductsByUser(request.user!.id);

  return response.status(200).json(products);
};

export const createProductHandler = async (
  request: Request,
  response: Response
) => {
  const payload = productSchema.parse(request.body);
  const product = await createProduct({
    ...payload,
    userId: request.user!.id
  });

  return response.status(201).json(product);
};

export const updateProductHandler = async (
  request: Request,
  response: Response
) => {
  const { id } = paramsSchema.parse(request.params);
  const payload = productSchema.parse(request.body);
  const product = await updateProduct(request.user!.id, id, payload);

  return response.status(200).json(product);
};

export const deleteProductHandler = async (
  request: Request,
  response: Response
) => {
  const { id } = paramsSchema.parse(request.params);
  await deleteProduct(request.user!.id, id);

  return response.status(204).send();
};

export const getProductById = async (request: Request, response: Response) => {
  const { id } = paramsSchema.parse(request.params);
  const product = await getProductByIdService(request.user!.id, id);

  return response.status(200).json(product);
};
