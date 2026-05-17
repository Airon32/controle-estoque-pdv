export type CheckoutItemPayload = {
  productId: number;
  quantity: number;
};

export type CheckoutPayload = {
  paymentMethod?: string;
  items: CheckoutItemPayload[];
};
