import dotenv from "dotenv";

dotenv.config();

import DailyRotateFile from "winston-daily-rotate-file";

import path from "path";
import {createLogger, format, transports} from "winston";

const {combine, timestamp, printf, errors, colorize, json} = format;

const logFormat = printf(({level, message, timestamp, stack}) => {
	return `${timestamp} ${level}: ${stack || message}`;
});

const logger = createLogger({
	level: "info",
	format: combine(timestamp({format: "YYYY-MM-DD HH:mm:ss"}), errors({stack: true}), logFormat),
	transports: [
		new transports.Console({
			format: combine(colorize(), logFormat),
		}),
		new DailyRotateFile({
			dirname: path.join(__dirname, "../../logs"),
			filename: "app-%DATE%.log",
			datePattern: "YYYY-MM-DD",
			maxSize: "20m",
			maxFiles: "14d",
			zippedArchive: true,
			format: combine(json()),
		}),
	],
	exceptionHandlers: [
		new transports.File({
			dirname: path.join(__dirname, "../../logs"),
			filename: "exceptions.log",
		}),
	],
	rejectionHandlers: [
		new transports.File({
			dirname: path.join(__dirname, "../../logs"),
			filename: "rejections.log",
		}),
	],
});

if (process.env.MODE !== "production") {
	logger.add(
		new transports.Console({
			format: combine(colorize(), logFormat),
		}),
	);
}

export default logger;
