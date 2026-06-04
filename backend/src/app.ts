import cors from "cors";
import express from "express";

import healthRoute from "./routes/health.route.js";
import consultationRoute from "./routes/consultation.route.js";

const app = express();

app.disable("x-powered-by");
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/health", healthRoute);
app.use("/api/consultations", consultationRoute);

export default app;
