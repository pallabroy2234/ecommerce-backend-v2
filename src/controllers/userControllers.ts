import { Request, Response, NextFunction } from 'express';






// * handleNewUser -> /api/v1/user/new
export const handleNewUser = async (req:Request, res:Response, next:NextFunction)=> {
    try {

    }catch (error) {
        next(error)
    }
}


