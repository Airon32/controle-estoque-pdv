import { z } from "zod";

export const productSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do produto."),
  sku: z.string().trim().min(2, "Informe o SKU."),
  price: z.coerce.number().min(0, "O preco nao pode ser negativo."),
  quantity: z.coerce.number().int().min(0, "A quantidade nao pode ser negativa.")
});
