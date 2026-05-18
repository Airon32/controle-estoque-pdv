export type ImportField = "name" | "sku" | "price" | "quantity";

export type ProductImportMapping = Partial<Record<ImportField, string>>;

export type ImportProductPayload = {
  fileBuffer: Buffer;
  fileName: string;
  mapping: ProductImportMapping;
  userId: string;
};

export type ImportProductError = {
  row: number;
  message: string;
};
