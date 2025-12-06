import { Router } from "express";
import {
    auth2Callback,
    getAuthUrl,
    revokeToken,
} from "@/controllers/authController.js";
import { verifyToken } from "@/middleware/authMiddleware.js";

const authRouter = Router();

authRouter.get("/url", getAuthUrl);
authRouter.get("/oauth2callback", auth2Callback);
authRouter.post("/revoke", verifyToken, revokeToken);

export default authRouter;
