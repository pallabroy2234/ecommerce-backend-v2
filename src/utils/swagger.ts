import {Express, Request, Response} from "express";
import {version} from "../../package.json";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import logger from "./logger.js";

// * Swagger Options

const options: swaggerJsdoc.Options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "Ecommerce API  Documentation",
			version: "1.0.0",
			description: "This is a simple CRUD API application made with Express and documented with Swagger",
			contact: {
				name: "Pallab Roy Tushar",
				email: "roy.pallabtushar2234@gmail.com",
			},
		},
		components: {
			securitySchemes: {
				bearerAuth: {
					type: "http",
					scheme: "bearer",
					bearerFormat: "JWT",
				},
			},
		},
		security: [
			{
				bearerAuth: [],
			},
		],
	},
	apis: ["./src/routes/*.ts", "./src/models/*.ts", "./src/types/*.ts", "./src/controllers/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

const swaggerDocs = (app: Express, port: string | number) => {
	// * Swagger page
	app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

	// * Docs in JSON format
	app.get("/docs-json", (req: Request, res: Response) => {
		res.setHeader("Content-Type", "application/json");
		res.send(swaggerSpec);
	});
	logger.info(`Docs are available at http://localhost:${port}/docs`);
};

export default swaggerDocs;
