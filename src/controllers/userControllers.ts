import { Request, Response, NextFunction } from 'express';
import UserModal from "../models/userModal.js";






// * handleNewUser -> /api/v1/user/new
export const handleNewUser = async (req:Request, res:Response, next:NextFunction)=> {
    try {
        const {}= req.body;



        const user  = await UserModal


    }catch (error) {
        next(error)
    }
}


