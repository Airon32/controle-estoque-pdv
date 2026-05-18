import { NextFunction, Request, Response } from "express";
import { supabaseAdmin } from "../config/supabase";

export const authenticateRequest = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const authorizationHeader = request.headers.authorization;

  if (!authorizationHeader?.startsWith("Bearer ")) {
    return response.status(401).json({
      message: "Nao autorizado."
    });
  }

  const token = authorizationHeader.replace("Bearer ", "").trim();

  if (!token) {
    return response.status(401).json({
      message: "Nao autorizado."
    });
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data.user) {
    return response.status(401).json({
      message: "Nao autorizado."
    });
  }

  request.user = {
    id: data.user.id,
    email: data.user.email
  };

  next();
};
