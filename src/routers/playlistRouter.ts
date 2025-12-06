import { Router } from "express";
import {
    getUserYTPlaylists,
    syncPlaylist,
} from "@/controllers/playlistController.js";
import { verifyToken } from "@/middleware/authMiddleware.js";

const playlistRouter = Router();

playlistRouter.post("/", verifyToken, getUserYTPlaylists);

playlistRouter.post("/sync", verifyToken, syncPlaylist);

export default playlistRouter;
