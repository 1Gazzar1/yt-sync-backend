import type { NextFunction, Request, Response } from "express";
import { ERRORS } from "@/errors/error.js";

export const verifyToken = async (
    /* 
    check if the user if authorized by verifying their access token 
    if not verified throw a 401 
    then later refresh the access token
    */
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const access_token = req.header("Authorization");

    if (!access_token) throw ERRORS.UNAUTHORIZED("token not found");

    const _token = access_token.replace("Bearer ", "");

    const response = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?access_token=${_token}`
    );
    // console.log(response);
    if (!response.ok) throw ERRORS.UNAUTHORIZED("Token expired! 💩");

    req.access_token = _token;

    next();
};

/**/
