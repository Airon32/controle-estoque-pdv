import { Request, Response } from "express";
import { getDashboardMetrics } from "../services/report-service";

export const getDashboard = async (request: Request, response: Response) => {
  const metrics = await getDashboardMetrics(request.user!.id);
  response.status(200).json(metrics);
};
