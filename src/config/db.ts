import { Sequelize } from "sequelize-typescript";
import dotenv from "dotenv";
import { getEnv } from "./env";
dotenv.config();

export const db = new Sequelize(getEnv("DATABASE_URL"), {
  models: [__dirname + "/../models/**/*"],
  logging: false,
  dialectOptions: {
    ssl: false,
  },
});
