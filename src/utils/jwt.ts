import jwt from "jsonwebtoken";
import { getEnv } from "../config/env";

export const generateJWT = (id: string): string => {
  const token = jwt.sign({ id }, getEnv("JWT_SECRET"), {
    expiresIn: "3d",
  });
  return token;
};
