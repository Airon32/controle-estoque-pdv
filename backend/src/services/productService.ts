import { prisma } from "../config/db";
import { ProductPayload } from "../types/product";
import { HttpError } from "../utils/http-error";

const serializeProduct = (product: {
  id: number;
  name: string;
  sku: string;
  price: unknown;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}) => ({
  ...product,
  price: Number(product.price)
});

export const listProducts = async () => {
  const products = await prisma.product.findMany({
    orderBy: [{ name: "asc" }]
  });

  return products.map(serializeProduct);
};

export const createProduct = async (payload: ProductPayload) => {
  const existingProduct = await prisma.product.findUnique({
    where: {
      sku: payload.sku
    }
  });

  if (existingProduct) {
    throw new HttpError(409, "Ja existe um produto com esse SKU.");
  }

  const product = await prisma.product.create({
    data: {
      name: payload.name.trim(),
      sku: payload.sku.trim().toUpperCase(),
      price: payload.price,
      quantity: payload.quantity
    }
  });

  return serializeProduct(product);
};

export const updateProduct = async (id: number, payload: ProductPayload) => {
  const existingProduct = await prisma.product.findUnique({
    where: {
      id
    }
  });

  if (!existingProduct) {
    throw new HttpError(404, "Produto nao encontrado.");
  }

  const duplicatedSku = await prisma.product.findFirst({
    where: {
      sku: payload.sku.trim().toUpperCase(),
      NOT: {
        id
      }
    }
  });

  if (duplicatedSku) {
    throw new HttpError(409, "Ja existe outro produto com esse SKU.");
  }

  const product = await prisma.product.update({
    where: {
      id
    },
    data: {
      name: payload.name.trim(),
      sku: payload.sku.trim().toUpperCase(),
      price: payload.price,
      quantity: payload.quantity
    }
  });

  return serializeProduct(product);
};

export const deleteProduct = async (id: number) => {
  const existingProduct = await prisma.product.findUnique({
    where: {
      id
    }
  });

  if (!existingProduct) {
    throw new HttpError(404, "Produto nao encontrado.");
  }

  await prisma.product.delete({
    where: {
      id
    }
  });
};
