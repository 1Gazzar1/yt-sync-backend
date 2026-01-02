import { configDotenv } from "dotenv";
import type { Request, Response } from "express";
import { google } from "googleapis";
import { ERRORS } from "@/errors/error.js";

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
    let finalUrl: string;
    if (process.env.HOST_IP) {
        const state = Buffer.from(process.env.HOST_IP).toString("base64");
        finalUrl = `${url}&state=${state}`;
    }
    finalUrl = url;
    res.status(200).json({
        finalUrl,
    });
    // res.redirect(url);
};
export const refreshToken = async (req: Request, res: Response) => {
    const refresh_token = req.body.refresh_token;

    if (!refresh_token || typeof refresh_token !== "string")
        throw ERRORS.BAD_REQUEST("Token not found or wrong format.");

    oauth2Client.setCredentials({ refresh_token });

    const newCred = await oauth2Client.refreshAccessToken();

    res.status(200).json({
        access_token: newCred.credentials.access_token,
        id_token: newCred.credentials.id_token,
    });
};

export const auth2Callback = async (req: Request, res: Response) => {
    const { code } = req.query;
    // const { tokens } = await oauth2Client.getToken(code as string);
    // console.log(tokens);
    // const HOST_IP_WITHOUT_PORT = process.env.HOST_IP.split(":")[0];
    // const appUrl = `exp://${HOST_IP_WITHOUT_PORT}:8081/--/home?access_token=${tokens.access_token}&refresh_token=${tokens.refresh_token}&id_token=${tokens.id_token}`;
    res.send(`
      <html>
        <body style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; font-family:sans-serif;">
          <h1>DEEP LINKING IS BROKEN , IDK WHY!!!!!!</h1>
          <h2>THIS IS THE MOST INSECURE SHIT OF ALL TIME</h2>
          <h2 style="padding:15px 25px; background:#cc0000; color:white; text-decoration:none; border-radius:10px; font-weight:bold;">
            Your Code is: ${code}
          </h2>
        </body>
      </html>
    `);
};
export const getTokens = async (req: Request, res: Response) => {
    const { code } = req.query;
    const { tokens } = await oauth2Client.getToken(code as string);
    console.log(tokens);
    const HOST_IP_WITHOUT_PORT = process.env.HOST_IP.split(":")[0];
    // const appUrl = `exp://${HOST_IP_WITHOUT_PORT}:8081/--/home?access_token=${tokens.access_token}&refresh_token=${tokens.refresh_token}&id_token=${tokens.id_token}`;
    res.status(200).json(tokens);
};

export const revokeToken = async (req: Request, res: Response) => {
    // tokens that can be revoked are refresh or access tokens
    // you can't revoke the id token (jwt)
    const { refresh_token } = req.body;

    if (!refresh_token) throw ERRORS.BAD_REQUEST("refresh_token undefined");

    try {
        const refreshStatus = await oauth2Client.revokeToken(refresh_token);
        console.log(refreshStatus);
    } catch (error) {
        throw ERRORS.INTERNAL("Google said no. 💀");
    }
    res.status(200).json({ message: "token revoked successfully!" });
};
