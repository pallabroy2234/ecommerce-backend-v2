import express from "express";

const userRouter = express.Router();
import {handleNewUser} from "../controllers/userControllers.js";

// * Route -> /api/v1/user/new
userRouter.post("/new", handleNewUser);

export default userRouter;
