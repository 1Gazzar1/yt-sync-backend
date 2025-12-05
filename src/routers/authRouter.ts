import { Router } from "express";
import {
    auth2Callback,
    getAuthUrl,
    revokeToken,
} from "src/controllers/authController";
import { verifyToken } from "src/middleware/authMiddleware";

const authRouter = Router();

authRouter.get("/url", getAuthUrl);
authRouter.get("/oauth2callback", auth2Callback);
authRouter.post("/revoke", verifyToken, revokeToken);

export default authRouter;
