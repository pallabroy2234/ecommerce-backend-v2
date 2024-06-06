import mongoose from "mongoose";
import dotenv from "dotenv";
import logger from "./logger.js";

dotenv.config();
const connectDatabase = async (options = {}) => {
	try {
		const mode = process.env.MODE;
		const prodDbUrl = process.env.PRODUCTION_DATABASE_URL;
		const prodDbName = process.env.PRODUCTION_DATABASE_NAME;
		const devDbUrl = process.env.DEVELOPMENT_DATABASE_URL;
		const devDbName = process.env.DEVELOPMENT_DATABASE_NAME;

		if (mode === "production") {
			if (!prodDbUrl || !prodDbName) {
				const errorMessage = "Production database URL or name is not defined";
				logger.error(errorMessage);
				throw new Error(errorMessage);
			}
			await mongoose.connect(prodDbUrl as string, {
				...options,
				dbName: prodDbName as string,
			});

			mongoose.connection.on("error", (error) => {
				// console.error("Mongodb connection error", error);
				logger.error("Mongodb connection error", error);
			});
		} else {
			if (!devDbUrl || !devDbName) {
				throw new Error("Development database URL or name is not defined");
			}
			await mongoose.connect(devDbUrl as string, {
				...options,
				dbName: devDbName as string,
			});
			// console.log("Mongodb local connection established");
			logger.info("Mongodb local connection established");
			mongoose.connection.on("error", (error) => {
				// console.error("Mongodb local connection error", error);
				logger.error("Mongodb local connection error", error);
			});
		}
	} catch (e) {
		// console.error("Could not connect to DB", e);
		logger.error("Could not connect to DB", e);
		process.exit(1);
	}
};

export default connectDatabase;
