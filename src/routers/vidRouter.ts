import {
    getAllVidsByJobId,
    getVidByJobIdAndSongId,
} from "@/controllers/vidController.js";
import { verifyToken } from "@/middleware/authMiddleware.js";
import { folderExists } from "@/middleware/vidMiddleware.js";
import { Router } from "express";

const vidRouter = Router();

// download all songs from job
vidRouter.get("/:jobId/batch", getAllVidsByJobId);

// download a specific song from job
vidRouter.get("/:jobId/:songId", getVidByJobIdAndSongId);

// middleware to make sure the jobId is correct

export default vidRouter;
