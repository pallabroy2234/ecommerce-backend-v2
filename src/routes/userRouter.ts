import express from "express";

const userRouter = express.Router();
import {handleGetAllUsers, handleGetUser, handleNewUser} from "../controllers/userControllers.js";
import {validateUser} from "../validators/validateUser.js";
import {runValidation} from "../validators/index.js";

// * Route -> /api/v1/user/new
userRouter.post("/new", validateUser, runValidation(), handleNewUser);

// * Route -> /api/v1/user/all
userRouter.get("/all", handleGetAllUsers);

// * Route -> /api/v1/user/:id
userRouter.get("/:id", handleGetUser);

export default userRouter;
