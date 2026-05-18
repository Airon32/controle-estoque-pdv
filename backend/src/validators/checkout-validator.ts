import { z } from "zod";

export const checkoutSchema = z.object({
  paymentMethod: z.string().trim().min(1).max(30).optional(),
  items: z
    .array(
      z.object({
        productId: z.coerce.number().int().positive(),
        quantity: z.coerce.number().int().positive()
      })
    )
    .min(1, "Adicione ao menos um item no carrinho.")
});
