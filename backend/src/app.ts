import "express-async-errors";
import cors from "cors";
import express from "express";
import { authenticateRequest } from "./middlewares/auth-middleware";
import { productRoutes } from "./routes/productRoutes";
import { checkoutRoutes } from "./routes/checkout-routes";
import { reportRoutes } from "./routes/report-routes";
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

app.use("/products", authenticateRequest, productRoutes);
app.use("/checkout", authenticateRequest, checkoutRoutes);
app.use("/reports", authenticateRequest, reportRoutes);
app.use(errorHandler);

export { app };
