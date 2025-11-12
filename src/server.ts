import express, { Application } from "express";
import colors from "colors";
import morgan from "morgan";
import { db } from "./config/db";
import router from "./routes/index.routes";

export async function connectDB() {
  try {
    await db.authenticate();
    db.sync();
    console.log(colors.blue.bold("Conexión exitosa en la BD"));
  } catch (error) {
    console.log(colors.red.bold("Fallo conexión a la BD"));
  }
}

connectDB();
const app: Application = express();

app.use(morgan("dev"));

app.use(express.json());

app.use("/api", router);

export default app;
