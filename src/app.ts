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

dotenv.config();
const port: string | number = process.env.PORT || 5000;
const stripeKey: string = process.env.STRIPE_SECRET_KEY || "";

// *   Database connection
await connectDatabase();

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

const allowedOrigins = [
	"http://localhost:4000",
	"https://ecommerce-frontend-v2-hf4ij4sfz-pallab-roy-tushars-projects.vercel.app/",
];

app.use(
	cors({
		origin: function (origin, callback) {
			// Allow requests with no origin (e.g., mobile apps or curl)
			if (!origin) return callback(null, true);
			if (allowedOrigins.indexOf(origin) === -1) {
				const msg = "The CORS policy for this site does not allow access from the specified origin.";
				return callback(new Error(msg), false);
			}
			return callback(null, true);
		},
		credentials: true, // Enable cookies or authorization headers to be sent
	}),
);

// app.use(cors());

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

// ! Not Found Middleware
app.use(notFound);

// ! Error handling middleware
app.use(errorMiddleWare);

app.listen(port, async () => {
	logger.info(`Server is working on http://localhost:${port}`);
});
