import mongoose from "mongoose";
import dotenv from "dotenv";
import logger from "./logger.js";
import {tr} from "@faker-js/faker";

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
				const errorMessage =
					"Production database URL or name is not defined";
				logger.error(errorMessage);
				throw new Error(errorMessage);
			}
			await mongoose.connect(prodDbUrl as string, {
				...options,
				dbName: prodDbName as string,
			});

			logger.info("MongoDB production connection established");

			mongoose.connection.on("error", (error) => {
				// console.error("Mongodb connection error", error);
				logger.error("Mongodb connection error", error);
			});
		} else if (mode === "development") {
			if (!devDbUrl || !devDbName) {
				throw new Error(
					"Development database URL or name is not defined",
				);
			}
			await mongoose.connect(devDbUrl as string, {
				...options,
				dbName: devDbName as string,
			});

			logger.info("Mongodb local connection established");
			mongoose.connection.on("error", (error) => {
				// console.error("Mongodb local connection error", error);
				logger.error("Mongodb local connection error", error);
			});
		} else if (mode !== "production" && mode !== "development") {
			logger.error("Only production and development modes are allowed");
			throw new Error(
				"Only production and development modes are allowed",
			);
		}
	} catch (e) {
		// console.error("Could not connect to DB", e);
		logger.error("Could not connect to DB", e);
		process.exit(1);
	}
};

export default connectDatabase;
