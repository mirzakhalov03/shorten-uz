import cors, { CorsOptions } from "cors";
import dotenv from "dotenv";

dotenv.config();

export const CORS_ORIGINS = process.env.CORS_ORIGINS ?? "http://localhost:5173";

const allowedOrigins = CORS_ORIGINS.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

export default cors;
