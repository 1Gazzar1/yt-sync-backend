import type { Request, Response } from "express";
import { google } from "googleapis";
import { ERRORS } from "@/errors/error.js";
import { scheduleBreeSyncPlaylistJob } from "@/bg/index.js";
import { getFormattedPlaylists, getVideoIds } from "@/utils/playlistUtil.js";

const oAuth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URL
);

export const getUserYTPlaylists = async (req: Request, res: Response) => {
    // const token = req.token;
    const { refresh_token } = req.body;

    const access_token = req.access_token;
    if (!access_token) throw ERRORS.NOTFOUND("token not found");

    // setting credentials for api access
    oAuth2Client.setCredentials({ access_token, refresh_token });

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

    const access_token = req.access_token;
    if (!access_token) throw ERRORS.NOTFOUND("token not found");

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

    scheduleBreeSyncPlaylistJob(vidIds, []); // for now the local videoIds are empty

    res.status(200).json({
        message: "scheduled a job for you, come back later 🕔",
    });
};
