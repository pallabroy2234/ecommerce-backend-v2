import express, {Express} from "express";
import dotenv from "dotenv";
import logger from "./utils/logger.js";
import morgan from "morgan";
import bodyParser from "body-parser";
import {errorMiddleWare, notFound} from "./middlewares/error.js";
import connectDatabase from "./utils/feature.js";
import swaggerDocs from "./utils/swagger.js";
import Stripe from "stripe";
import cors from "cors";
import {v2 as cloudinary} from "cloudinary";

dotenv.config();
const port: string | number = process.env.PORT || 5000;
const stripeKey: string = process.env.STRIPE_SECRET_KEY || "";

// * Stripe
export const stripe = new Stripe(stripeKey, {});

// *  Importing routes
import {userRouter} from "./routes/userRouter.js";
import productRouter from "./routes/productRouter.js";
import orderRouter from "./routes/orderRouter.js";
import paymentRouter from "./routes/paymentRouter.js";
import dashboardRouter from "./routes/statsRouter.js";

const app: Express = express();

// * Swagger Docs
swaggerDocs(app, port);

// * Middleware
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(cors());

//  Routes Define
app.use("/api/v1/user", userRouter);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/payment", paymentRouter);
app.use("/api/v1/dashboard", dashboardRouter);

// * Static Files
app.use("/public", express.static("public"));
//  Basic route
app.get("/", (req, res) => {
	res.send("Welcome to Ecommerce v2 Application!");
});

// * config cloudinary
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
	api_key: process.env.CLOUDINARY_API_KEY as string,
	api_secret: process.env.CLOUDINARY_API_SECRET as string,
});

// ! Not Found Middleware
app.use(notFound);

// ! Error handling middleware
app.use(errorMiddleWare);

app.listen(port, async () => {
	// *   Database connection
	await connectDatabase();
	logger.info(`Server is working on http://localhost:${port}`);
});

export default app;
