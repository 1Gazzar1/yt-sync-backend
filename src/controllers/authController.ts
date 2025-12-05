import { configDotenv } from "dotenv";
import type { Request, Response } from "express";
import { google } from "googleapis";
import { ERRORS } from "src/errors/error";
import { RequestBodyType } from "src/types/types";

configDotenv();

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URL
);
const scopes = [
    "https://www.googleapis.com/auth/youtube.readonly",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
];

export const getAuthUrl = (req: Request, res: Response) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: scopes,
        prompt: "consent",
    });

    res.status(200).json({
        url,
    });
    // res.redirect(url);
};

export const auth2Callback = async (req: Request, res: Response) => {
    const { code } = req.query;
    const { tokens } = await oauth2Client.getToken(code as string);
    console.log(tokens);
    res.send(`<h1> yo, good job 👍 </h1> <h2> this is your tokens </h2>`);
};

export const revokeToken = async (req: Request, res: Response) => {
    // tokens that can be revoked are refresh or access tokens
    // you can't revoke the id token (jwt)
    const { refresh_token }: RequestBodyType = req.body;

    if (!refresh_token) throw ERRORS.BAD_REQUEST("refresh_token undefined");

    try {
        const refreshStatus = await oauth2Client.revokeToken(refresh_token);
        console.log(refreshStatus);
    } catch (error) {
        throw ERRORS.INTERNAL("Google said no. 💀");
    }
    res.status(200).json({ message: "token revoked successfully!" });
};
