import type { NextFunction, Request, Response } from "express";
import { google } from "googleapis";
import { ERRORS } from "src/errors/error";
import { Credentials, RequestBodyType } from "src/types/types";

const oAuth2Client = new google.auth.OAuth2(process.env.CLIENT_ID);

export const verifyToken = async (
    /* 
    check if the user if authorized by verifying their id token (jwt)
    if not verified throw a 401 else setup user info in req
    then later refresh the access token
    */
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token = req.header("Authorization");

    if (!token) throw ERRORS.BAD_REQUEST("token not found");

    const _token = token.replace("Bearer ", "");

    const ticket = await oAuth2Client.verifyIdToken({
        idToken: _token,
        audience: process.env.CLIENT_ID,
    });

    if (!ticket) throw ERRORS.UNAUTHORIZED("invalid token / Unauthorized");

    const payLoad = ticket.getPayload();

    if (!payLoad) throw ERRORS.BAD_REQUEST("token payload empty");

    req.user = {
        name: payLoad.name!,
        email: payLoad.email!,
        profile: payLoad.profile!,
    };

    req.token = _token;

    next();
};

export const refreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    /* 
    refresh the access token via the refresh token given from the client
    only triggers if the expiry date is less than 10 mins 
    */
    const { refresh_token }: RequestBodyType = req.body;

    if (!refresh_token) throw ERRORS.NOTFOUND("token not found");

    oAuth2Client.setCredentials({ refresh_token });

    try {
        const newCred = await oAuth2Client.refreshAccessToken();

        req.credentials = newCred.credentials as any as Credentials;
    } catch (error) {
        throw ERRORS.UNAUTHORIZED("failed to refresh token");
    }

    next();
};

/* 
the id token is accessed through the auth header 
the access and refresh tokens are accessed through the req body (sent from the client)
then at the end always send a ResponseType obj , which looks like this:  
{
    data: Playlist[] | Video[];
    tokens: {
        refresh_token: string;
        access_token: string;
        scope: string;
        token_type: string;
        id_token: string;
        expiry_date: number;
    };
};

the point of this is to not have a db, so the tokens are passed between the server and client constantly
*/
