import { Prisma } from "@prisma/client";
import { prisma } from "../config/db";
import { AuthenticatedCheckoutPayload } from "../types/checkout";
import { HttpError } from "../utils/http-error";

export const checkout = async (payload: AuthenticatedCheckoutPayload) => {
  const productIds = payload.items.map((item) => item.productId);

  const products = await prisma.product.findMany({
    where: {
      userId: payload.userId,
      id: {
        in: productIds
      }
    }
  });

  if (products.length !== productIds.length) {
    throw new HttpError(404, "Um ou mais produtos nao foram encontrados.");
  }

  const productMap = new Map(products.map((product) => [product.id, product]));

  const normalizedItems = payload.items.map((item) => {
    const product = productMap.get(item.productId);

    if (!product) {
      throw new HttpError(404, "Produto nao encontrado.");
    }

    if (product.quantity < item.quantity) {
      throw new HttpError(
        400,
        `Estoque insuficiente para o produto ${product.name}.`
      );
    }

    const unitPrice = Number(product.price);
    const subtotal = unitPrice * item.quantity;

    return {
      productId: product.id,
      quantity: item.quantity,
      unitPrice,
      subtotal
    };
  });

  const total = normalizedItems.reduce((sum, item) => sum + item.subtotal, 0);

  const sale = await prisma.$transaction(async (tx) => {
    for (const item of normalizedItems) {
      await tx.product.update({
        where: {
          id: item.productId
        },
        data: {
          quantity: {
            decrement: item.quantity
          }
        }
      });
    }

    return tx.sale.create({
      data: {
        userId: payload.userId,
        total: new Prisma.Decimal(total),
        paymentMethod: payload.paymentMethod,
        saleItems: {
          create: normalizedItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: new Prisma.Decimal(item.unitPrice),
            subtotal: new Prisma.Decimal(item.subtotal)
          }))
        }
      },
      include: {
        saleItems: {
          include: {
            product: true
          }
        }
      }
    });
  });

  return {
    id: sale.id,
    total: Number(sale.total),
    paymentMethod: sale.paymentMethod,
    createdAt: sale.createdAt,
    items: sale.saleItems.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product.name,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      subtotal: Number(item.subtotal)
    }))
  };
};
