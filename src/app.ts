import express, {ErrorRequestHandler, Response, Request, NextFunction} from "express";
import dotenv from "dotenv";
import logger from "./utils/logger.js";
import morgan from "morgan";
import bodyParser from "body-parser";
import {errorMiddleWare, notFound} from "./middlewares/error.js";
import connectDatabase from "./utils/feature.js";
dotenv.config();

const port = process.env.PORT || 4001;

// *  Importing routes
import userRouter from "./routes/userRouter.js";

const app = express();

//  Database connection
await connectDatabase();

// * Middleware
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//  Routes Define
app.use("/api/v1/user", userRouter);

//  Basic route
app.get("/", (req, res) => {
	res.send("Welcome to Ecommerce v2 Application!");
});

// ! Not Found Middleware
app.use(notFound);

// ! Error handling middleware
app.use(errorMiddleWare);

app.listen(port, () => {
	// console.log(`Server is working on http://localhost:${port}`);
	logger.info(`Server is working on http://localhost:${port}`);
});
