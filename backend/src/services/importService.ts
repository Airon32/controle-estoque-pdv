import { parse } from "csv-parse/sync";
import * as XLSX from "xlsx";
import { prisma } from "../config/db";
import {
  ImportField,
  ImportProductError,
  ImportProductPayload
} from "../types/import";
import { HttpError } from "../utils/http-error";

type ImportRow = Record<string, unknown>;

const requiredFields: ImportField[] = ["name", "sku", "price"];

const normalizeHeader = (value: unknown) => String(value ?? "").trim();

const chunk = <T>(items: T[], size: number) => {
  const chunks: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
};

const parseSpreadsheetRows = (buffer: Buffer) => {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    throw new HttpError(400, "O arquivo nao possui planilhas validas.");
  }

  const sheet = workbook.Sheets[firstSheetName];

  return XLSX.utils.sheet_to_json<ImportRow>(sheet, {
    defval: "",
    raw: false
  });
};

const parseCsvRows = (buffer: Buffer) => {
  return parse(buffer, {
    bom: true,
    columns: true,
    skip_empty_lines: true,
    trim: true
  }) as ImportRow[];
};

const parseRowsByExtension = (fileName: string, fileBuffer: Buffer) => {
  const normalizedName = fileName.toLowerCase();

  if (normalizedName.endsWith(".csv")) {
    return parseCsvRows(fileBuffer);
  }

  if (
    normalizedName.endsWith(".xlsx") ||
    normalizedName.endsWith(".xls") ||
    normalizedName.endsWith(".xlsm")
  ) {
    return parseSpreadsheetRows(fileBuffer);
  }

  throw new HttpError(
    400,
    "Formato de arquivo nao suportado. Envie CSV, XLSX, XLS ou XLSM."
  );
};

const parseNumber = (value: unknown) => {
  if (typeof value === "number") {
    return value;
  }

  const rawValue = String(value ?? "").trim();

  if (!rawValue) {
    return Number.NaN;
  }

  let normalized = rawValue;

  if (rawValue.includes(",") && rawValue.includes(".")) {
    normalized = rawValue.replace(/\./g, "").replace(",", ".");
  } else if (rawValue.includes(",")) {
    normalized = rawValue.replace(",", ".");
  }

  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

export const importProductsFromFile = async ({
  fileBuffer,
  fileName,
  mapping,
  userId
}: ImportProductPayload) => {
  for (const field of requiredFields) {
    if (!mapping[field]) {
      throw new HttpError(400, `Mapeie a coluna obrigatoria: ${field}.`);
    }
  }

  const rows = parseRowsByExtension(fileName, fileBuffer);

  if (rows.length === 0) {
    throw new HttpError(400, "O arquivo enviado nao possui linhas para importar.");
  }

  const errors: ImportProductError[] = [];
  const seenSkus = new Set<string>();
  const validRows: Array<{
    rowNumber: number;
    name: string;
    sku: string;
    price: number;
    quantity: number;
  }> = [];

  rows.forEach((row, index) => {
    const rowNumber = index + 2;
    const name = String(row[mapping.name ?? ""] ?? "").trim();
    const sku = String(row[mapping.sku ?? ""] ?? "")
      .trim()
      .toUpperCase();
    const price = parseNumber(row[mapping.price ?? ""]);
    const quantityColumn = mapping.quantity ? row[mapping.quantity] : 0;
    const quantity = mapping.quantity ? parseNumber(quantityColumn) : 0;

    if (!name) {
      errors.push({ row: rowNumber, message: "Nome ausente." });
      return;
    }

    if (!sku) {
      errors.push({ row: rowNumber, message: "SKU ausente." });
      return;
    }

    if (Number.isNaN(price) || price < 0) {
      errors.push({ row: rowNumber, message: "Preco invalido." });
      return;
    }

    if (Number.isNaN(quantity) || quantity < 0 || !Number.isInteger(quantity)) {
      errors.push({ row: rowNumber, message: "Quantidade invalida." });
      return;
    }

    if (seenSkus.has(sku)) {
      errors.push({
        row: rowNumber,
        message: `SKU duplicado no arquivo: ${sku}.`
      });
      return;
    }

    seenSkus.add(sku);
    validRows.push({
      rowNumber,
      name,
      sku,
      price,
      quantity
    });
  });

  const skuChunks = chunk(validRows.map((row) => row.sku), 500);
  const existingSkus = new Set<string>();

  for (const skuChunk of skuChunks) {
    const products = await prisma.product.findMany({
      where: {
        userId,
        sku: {
          in: skuChunk
        }
      },
      select: {
        sku: true
      }
    });

    products.forEach((product) => existingSkus.add(product.sku));
  }

  const rowsToInsert = validRows.filter((row) => {
    if (existingSkus.has(row.sku)) {
      errors.push({
        row: row.rowNumber,
        message: `SKU ja existente na base: ${row.sku}.`
      });
      return false;
    }

    return true;
  });

  if (rowsToInsert.length > 0) {
    await prisma.product.createMany({
      data: rowsToInsert.map(({ rowNumber, ...row }) => ({
        ...row,
        userId
      })),
      skipDuplicates: true
    });
  }

  return {
    insertedCount: rowsToInsert.length,
    skippedCount: errors.length,
    totalRows: rows.length,
    errors
  };
};
