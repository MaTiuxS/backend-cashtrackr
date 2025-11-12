import type { Request, Response, NextFunction } from "express";
import { getEnv } from "../config/env";
import User from "../models/User";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const bearer = req.headers.authorization;

  if (!bearer) {
    const error = new Error("No autorizado");
    return res.status(401).json({ error: error.message });
  }

  const [, token] = bearer.split(" ");

  if (!token) {
    const error = new Error("No autorizado");
    return res.status(401).json({ error: error.message });
  }

  try {
    const decoded = jwt.verify(token, getEnv("JWT_SECRET"));
    if (typeof decoded === "object" && decoded.id) {
      const user = await User.findByPk(decoded.id, {
        attributes: ["id", "username", "email"],
      });

      if (!user) {
        return res.status(401).json({ error: "Usuario no encontrado" });
      }

      req.user = user;
      return next();
    }
  } catch (error) {
    // console.log(error)
    return res.status(500).json({ error: "Token no valido" });
  }
};
