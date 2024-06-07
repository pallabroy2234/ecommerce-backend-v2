import express from "express";

const userRouter = express.Router();
import {handleNewUser} from "../controllers/userControllers.js";
import {validateUser} from "../validators/validateUser.js";
import {runValidation} from "../validators/index.js";

// * Route -> /api/v1/user/new
userRouter.post("/new", validateUser, runValidation(), handleNewUser);

export default userRouter;
