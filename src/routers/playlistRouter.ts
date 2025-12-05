import { Router } from "express";
import { getUserYTPlaylists } from "src/controllers/playlistController";
import { refreshToken, verifyToken } from "src/middleware/authMiddleware";

const playlistRouter = Router();

playlistRouter.post("/", verifyToken, refreshToken, getUserYTPlaylists);

export default playlistRouter;
