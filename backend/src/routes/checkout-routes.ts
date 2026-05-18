import { Router } from "express";
import { postCheckout } from "../controllers/checkout-controller";

const checkoutRoutes = Router();

checkoutRoutes.post("/", postCheckout);

export { checkoutRoutes };
