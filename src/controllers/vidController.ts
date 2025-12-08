import { streamDirectoryOfSongs, streamSong } from "@/utils/vidUtil.js";
import { Request, Response } from "express";

export const getAllVidsByJobId = async (req: Request, res: Response) => {
    // get the jobId from path params
    // endpoint: /vid/:jobId/batch
    // this should be called after /playlist/sync/status returns {done : True}
    // will create a writestream to the client

    const jobId = req.params.jobId;

    res.header("Content-Type", "application/zip");

    await streamDirectoryOfSongs(res, jobId);

    res.end();
};
export const getVidByJobIdAndSongId = async (req: Request, res: Response) => {
    // get the jobId and songId from path params
    // endpoint: /vid/:jobId/:songId
    // this should be called after /playlist/sync/status returns {done : True}
    // will create a writestream to the client

    const jobId = req.params.jobId;
    const songId = req.params.songId;

    res.header("Content-Type", "audio/mpeg");

    await streamSong(res, jobId, songId);

    res.end();
};
