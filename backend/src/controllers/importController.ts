import { Request, Response } from "express";
import { z } from "zod";
import { importProductsFromFile } from "../services/importService";
import { HttpError } from "../utils/http-error";

const mappingSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  price: z.string().min(1),
  quantity: z.string().min(1).optional()
});

export const importProductsHandler = async (
  request: Request,
  response: Response
) => {
  if (!request.file) {
    throw new HttpError(400, "Envie um arquivo para importar.");
  }

  const rawMapping =
    typeof request.body.mapping === "string"
      ? JSON.parse(request.body.mapping)
      : request.body.mapping;
  const mapping = mappingSchema.parse(rawMapping);

  const result = await importProductsFromFile({
    fileBuffer: request.file.buffer,
    fileName: request.file.originalname,
    mapping,
    userId: request.user!.id
  });

  return response.status(201).json(result);
};
