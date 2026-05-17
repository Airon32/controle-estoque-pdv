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
