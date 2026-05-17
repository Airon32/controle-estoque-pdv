import "express-async-errors";
import cors from "cors";
import express from "express";
import { productRoutes } from "./routes/productRoutes";
import { checkoutRoutes } from "./routes/checkout-routes";
import { errorHandler } from "./middlewares/error-handler";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173"
  })
);
app.use(express.json());

app.get("/health", (_request, response) => {
  response.status(200).json({
    status: "ok",
    service: "controle-estoque-pdv-backend",
    timestamp: new Date().toISOString()
  });
});

app.use("/products", productRoutes);
app.use("/checkout", checkoutRoutes);
app.use(errorHandler);

export { app };
