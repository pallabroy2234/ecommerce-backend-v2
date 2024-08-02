import express, {Express} from "express";
import dotenv from "dotenv";
import logger from "./utils/logger.js";
import morgan from "morgan";
import bodyParser from "body-parser";
import {errorMiddleWare, notFound} from "./middlewares/error.js";
import connectDatabase from "./utils/feature.js";
import swaggerDocs from "./utils/swagger.js";
dotenv.config();

// *   Database connection
await connectDatabase();

const port: string | number = process.env.PORT || 5000;

// *  Importing routes
import {userRouter} from "./routes/userRouter.js";
import productRouter from "./routes/productRouter.js";
import orderRouter from "./routes/orderRouter.js";
import paymentRouter from "./routes/paymentRouter.js";

const app: Express = express();

// * Swagger Docs
swaggerDocs(app, port);

// * Middleware
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//  Routes Define
app.use("/api/v1/user", userRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/payment", paymentRouter);

// * Static Files
app.use("/public", express.static("public"));
//  Basic route
app.get("/", (req, res) => {
	res.send("Welcome to Ecommerce v2 Application!");
});

// ! Not Found Middleware
app.use(notFound);

// ! Error handling middleware
app.use(errorMiddleWare);

app.listen(port, async () => {
	logger.info(`Server is working on http://localhost:${port}`);
});
