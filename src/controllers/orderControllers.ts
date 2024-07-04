import {TryCatch} from "../middlewares/error.js";
import {Request, Response, NextFunction} from "express";

export const handleNewOrder = TryCatch(
	async (req: Request, res: Response, next: NextFunction) => {},
);
