import { Router } from "express";
import {
    auth2Callback,
    getAuthUrl,
    getTokens,
    refreshToken,
    revokeToken,
} from "@/controllers/authController.js";
import { verifyToken } from "@/middleware/authMiddleware.js";

const authRouter = Router();

// get the url to redirect the user to google auth
authRouter.get("/url", getAuthUrl);

// fuck deep linking , i hate myself
authRouter.get("/tokens", getTokens);

// google callback after successful auth
// should return a nice http page to tell the use to go back to the app.
authRouter.get("/oauth2callback", auth2Callback);

// when the access_token if expired, the client hits this endpoint to refresh it.
authRouter.post("/refresh", refreshToken);

// to log out the user, and clear the token.
authRouter.post("/revoke", verifyToken, revokeToken);

export default authRouter;
