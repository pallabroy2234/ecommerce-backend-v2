import express from "express";
export const userRouter = express.Router();
import { handleDeleteUser, handleGetAllUsers, handleGetUser, handleNewUser, } from "../controllers/userControllers.js";
import { validateUser } from "../validators/validateUser.js";
import { runValidation } from "../validators/index.js";
import { isAdmin } from "../middlewares/auth.js";
/**
 * @openapi
 * /user/new:
 *  post:
 *    tags:
 *      - User
 *    summary: Create a new user
 *    description: Create a new user
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/User'
 *
 *    responses:
 *        200:
 *          description: ok
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  success:
 *                    type: boolean
 *                    example: true
 *                  message:
 *                    type: string
 *                    example: Welcome back Pallab Roy Tushar!
 *        201:
 *          description: created
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                   success:
 *                     type: boolean
 *                     example: true
 *                   message:
 *                     type: string
 *                     example: Welcome Pallab Roy Tushar! Your account has been created successfully!
 *        422:
 *          $ref: '#/components/responses/UnProcessableEntity'
 */
// * Route -> /api/v1/user/new
userRouter.post("/new", validateUser, runValidation(), handleNewUser);
// * Route -> /api/v1/user/all
userRouter.get("/all", isAdmin, handleGetAllUsers);
/**
 * @openapi
 * /user/{id}:
 *  get:
 *    tags:
 *      - User
 *    summary: Get a user by id
 *    description: Get a user by id
 *    parameters:
 *      - in: path
 *        name: userId
 *        required: true
 *    responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/User'
 *
 */
// * Route -> /api/v1/user/:id
userRouter.get("/:id", handleGetUser);
// * Route -> /api/v1/user/:id
userRouter.delete("/:id", isAdmin, handleDeleteUser);
