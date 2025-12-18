import type { Request, Response } from "express";
import { google } from "googleapis";
import { ERRORS } from "@/errors/error.js";
import { scheduleBreeSyncPlaylistJob } from "@/bg/index.js";
import {
    getFileSize,
    getFormattedPlaylists,
    getVideoIds,
} from "@/utils/playlistUtil.js";
import { randomBytes } from "crypto";
import { readFile } from "fs/promises";
import { JobStatusFile, Video } from "@/types/types.js";
import { getJobFiles } from "@/utils/vidUtil.js";
import { getVidIdFromMetadata } from "@/utils/metadata.js";

const oAuth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URL
);

export const getUserYTPlaylists = async (req: Request, res: Response) => {
    const access_token = req.access_token;
    if (!access_token) throw ERRORS.NOTFOUND("token not found");

    // setting credentials for api access
    oAuth2Client.setCredentials({ access_token });

    const service = google.youtube({
        version: "v3",
        auth: oAuth2Client,
    });

    const playlists = await getFormattedPlaylists(service);

    if (!playlists || playlists.length === 0)
        throw ERRORS.NOTFOUND("No Playlists Found!");

    res.status(200).json(playlists);
};
export const syncPlaylist = async (req: Request, res: Response) => {
    /*
        this endpoint takes the playlist id from query 
        and the video (songs) ids from the body  (for now i will just download and not sync) 
        then it will make a background job that will download all the videos(songs) 
        and store them on /tmp/job_123/ , the client polls until job is finished 
        then stream the songs back to the client 
    */
    const { localVideoIds } = req.body;

    if (!localVideoIds && Array.isArray(localVideoIds))
        throw ERRORS.BAD_REQUEST(
            "localVideoIds property Not Found! or wrong format"
        );

    const access_token = req.access_token;
    if (!access_token) throw ERRORS.UNAUTHORIZED("access token not found!");

    const { playlistId } = req.query;

    // setting credentials for api access
    oAuth2Client.setCredentials({ access_token });

    const service = google.youtube({
        version: "v3",
        auth: oAuth2Client,
    });

    const vidIds = await getVideoIds(service, playlistId as string);

    // res.status(200).json(vidIds);
    if (!vidIds || vidIds.length === 0)
        throw ERRORS.NOTFOUND("No Videos Found!");

    const randomChars = randomBytes(4).toString("hex");
    const jobName = `job-${randomChars}`;
    scheduleBreeSyncPlaylistJob(jobName, vidIds, localVideoIds);

    res.status(200).json({
        message: "scheduled a job for you <3, come back later 🕔",
        jobId: randomChars,
    });
};

export const checkJobStatus = async (req: Request, res: Response) => {
    // checks the job's status by it's id
    // get the job id from the query param
    // it returns { done : True / False }

    const { jobId } = req.query;

    if (!jobId || typeof jobId !== "string")
        throw ERRORS.BAD_REQUEST("jobId not there");

    const statusFilePath = `/tmp/job-${jobId}/status.json`;
    const fileContent: JobStatusFile = JSON.parse(
        (await readFile(statusFilePath)).toString()
    );

    res.status(200).json({ done: fileContent.status === "done" });
};
export const getJobMetadata = async (req: Request, res: Response) => {
    // gets each video and it's title, size, thumbnail
    // and total number of vids

    const { jobId } = req.query;

    if (!jobId || typeof jobId !== "string")
        throw ERRORS.BAD_REQUEST("jobId not there");
    const files = await getJobFiles(jobId);

    const videos: Video[] = await Promise.all(
        files.map(async (file) => {
            const p = `/tmp/job-${jobId}/${file}`;
            const id = await getVidIdFromMetadata(p);
            if (!id)
                throw ERRORS.INTERNAL(
                    `metadata faulty, failed to parse 'purl' metadata`
                );
            return {
                id: id,
                title: file,
                size: getFileSize(p),
                thumbnail: `https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
            };
        })
    );
    res.status(200).json({
        jobId,
        numOfVids: files.length,
        videos,
    });
};
