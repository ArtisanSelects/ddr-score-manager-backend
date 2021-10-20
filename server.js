import express from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import routes from "./api/routes.js";
import cookieParser from 'cookie-parser';
import requireAuth from "./api/authMiddleware.js";

const app = express();
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({limit: '16mb'}));
app.use(cookieParser());
app.use(requireAuth);
app.use("/api/v1/scores", routes);
app.use("*", (req, res) => res.status(404));

export default app;