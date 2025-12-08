import { Router } from "express";
import {
    checkJobStatus,
    getJobMetadata,
    getUserYTPlaylists,
    syncPlaylist,
} from "@/controllers/playlistController.js";
import { verifyToken } from "@/middleware/authMiddleware.js";

const playlistRouter = Router();

// get all user playlists
playlistRouter.get("/", getUserYTPlaylists);

// sync the local and remote (yt) playlist
// by scheduling a bg job that will download the diff.
playlistRouter.post("/sync", syncPlaylist);

// tells if the bg job is finished or not
// this endpoint is supposed to be polled.
playlistRouter.get("/sync/status", checkJobStatus);

// this is supposed to be called after this 👆 endpoint returns True.
playlistRouter.get("/sync/metadata", getJobMetadata);

export default playlistRouter;
