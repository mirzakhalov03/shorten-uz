import express from "express";
import cors, { corsOptions } from "./middleware/cors";
import { setupSwagger } from "./config/swagger";
import authRoutes from "./routes/auth.routes";
import urlRoutes from "./routes/url.routes";
import { redirect } from "./controllers/url.controller";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";

const app = express();

app.use(cors(corsOptions));
app.use(express.json());

setupSwagger(app);

app.get("/", (req, res) => {
  res.send("URL Shortener API is running");
});

app.use("/api/v1/auth", authRoutes);

app.use("/api/v1/urls", urlRoutes);

app.get("/:shortLink", redirect);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
