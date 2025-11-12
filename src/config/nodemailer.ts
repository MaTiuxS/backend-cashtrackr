import nodemailer from "nodemailer";
import { getEnv } from "./env";
import dotenv from "dotenv";
dotenv.config();

type TransportConfig = {
  host: string;
  port: number;
  auth: {
    user: string;
    pass: string;
  };
};
const config = (): TransportConfig => {
  return {
    host: getEnv("EMAIL_HOST"),
    port: +getEnv("EMAIL_PORT"),
    auth: {
      user: getEnv("EMAIL_USER"),
      pass: getEnv("EMAIL_PASS"),
    },
  };
};
export const transport = nodemailer.createTransport(config());
