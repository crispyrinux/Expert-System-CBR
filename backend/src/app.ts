import cors from "cors";
import express from "express";

import healthRoute from "./routes/health.route.js";

const app = express();

app.disable("x-powered-by");
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/health", healthRoute);

export default app;
