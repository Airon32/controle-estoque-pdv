export type Product = {
  id: number;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
};

export type ProductFormData = {
  name: string;
  sku: string;
  price: string;
  quantity: string;
};

export type ImportSystemField = "name" | "sku" | "price" | "quantity";

export type ImportFieldOption = {
  key: ImportSystemField;
  label: string;
  required?: boolean;
};

export type ImportPreviewRow = Record<string, string>;

export type ImportMapping = Partial<Record<ImportSystemField, string>>;

export type ImportResult = {
  insertedCount: number;
  skippedCount: number;
  totalRows: number;
  errors: Array<{
    row: number;
    message: string;
  }>;
};

export type CartItem = {
  productId: number;
  name: string;
  price: number;
  stock: number;
  quantity: number;
};

export type SaleResponse = {
  id: number;
  total: number;
  paymentMethod?: string;
  createdAt: string;
  items: Array<{
    id: number;
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }>;
};

export type DashboardData = {
  todaySalesTotal: number;
  monthSalesTotal: number;
  totalSalesCount: number;
  lowStockCount: number;
  lowStockProducts: Product[];
  topProducts: Array<{
    productId: number;
    name: string;
    totalQuantity: number;
    totalRevenue: number;
  }>;
  recentSales: Array<{
    id: number;
    total: number;
    paymentMethod: string | null;
    createdAt: string;
    itemsCount: number;
  }>;
};
