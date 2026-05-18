import { Router } from "express";
import { getDashboard } from "../controllers/report-controller";

const reportRoutes = Router();

reportRoutes.get("/dashboard", getDashboard);

export { reportRoutes };
