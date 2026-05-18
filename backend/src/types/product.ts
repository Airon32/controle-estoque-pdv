export type ProductPayload = {
  name: string;
  sku: string;
  price: number;
  quantity: number;
};

export type AuthenticatedProductPayload = ProductPayload & {
  userId: string;
};
