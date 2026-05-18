import { Request, Response } from "express";
import { checkout } from "../services/checkout-service";
import { checkoutSchema } from "../validators/checkout-validator";

export const postCheckout = async (request: Request, response: Response) => {
  const payload = checkoutSchema.parse(request.body);
  const sale = await checkout({
    ...payload,
    userId: request.user!.id
  });
  response.status(201).json(sale);
};
