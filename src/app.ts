import express from "express";

const port = 4000;

// * Importing routes
import userRouter from "./routes/userRouter.js";
import connectDatabase from "./utils/feature.js";

const app = express();

// * Routes Define
app.use("/api/v1/user", userRouter);

// * Basic route
app.get("/", (req, res) => {
	res.send("Welcome to Ecommerce v2 Application!");
});

app.listen(port, () => {
	console.log(`Server is working on http://localhost:${port}`);
	connectDatabase();
});
