import {
    getAllVidsByJobId,
    getVidByJobIdAndSongId,
} from "@/controllers/vidController.js";
import { folderExists } from "@/middleware/vidMiddleware.js";
import { Router } from "express";

const vidRouter = Router();

// download all songs from job
vidRouter.get("/:jobId/batch", folderExists, getAllVidsByJobId);

// download a specific song from job
vidRouter.post("/:jobId/:songId", folderExists, getVidByJobIdAndSongId);

// middleware to make sure the jobId is correct

export default vidRouter;
