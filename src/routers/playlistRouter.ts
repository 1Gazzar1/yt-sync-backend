import { Router } from "express";
import {
    checkJobStatus,
    getUserYTPlaylists,
    syncPlaylist,
} from "@/controllers/playlistController.js";

const playlistRouter = Router();

playlistRouter.post("/", getUserYTPlaylists);
playlistRouter.post("/sync", syncPlaylist);
playlistRouter.get("/sync/status", checkJobStatus);

export default playlistRouter;
