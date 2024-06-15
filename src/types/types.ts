import {NextFunction, Request, Response} from "express";

export interface NewUserRequestBody {
	_id: any;
	name: string;
	email: string;
	image: string;
	dob: Date;
	gender: "male" | "female" | "other";
}

// * NewProduct RequestBody
export interface NewProductRequestBody {
	name: string;
	category: string;
	image?: string;
	price: number;
	stock: number;
}

// * Controller Types

export type ControllerType = (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
