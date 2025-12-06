import type { Request, Response } from "express";
import { google, youtube_v3 } from "googleapis";
import { ERRORS } from "@/errors/error.js";
import type { Playlist, RequestBodyType } from "@/types/types.js";
import { scheduleBreeSyncPlaylistJob } from "@/bg/index.js";

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
    const { videoIds }: RequestBodyType = req.body;

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

    if (!vidIds || vidIds.length === 0)
        throw ERRORS.NOTFOUND("No Videos Found!");

    scheduleBreeSyncPlaylistJob(playlistId as string, []);

    res.status(200).json({
        message: "scheduled a job for you, come back later 🕔",
    });
};

// util

async function getVideoIds(service: youtube_v3.Youtube, playlistId: string) {
    const videos = await service.playlistItems.list({
        playlistId: playlistId,
        part: ["snippet"],
    });
    return videos.data.items
        ?.map((vid) => vid.id)
        .filter((id) => id !== undefined && id !== null);
}

async function getFormattedPlaylists(service: youtube_v3.Youtube) {
    const playlists = await service.playlists.list({
        part: ["snippet", "contentDetails"],
        mine: true,
        maxResults: 100,
    });
    const playlistObjs = playlists.data.items
        ?.map((pl) => {
            if (
                !pl.id ||
                !pl.snippet ||
                !pl.snippet.thumbnails ||
                !pl.contentDetails
            )
                return;
            const playlist: Playlist = {
                id: pl.id,
                url: `https://www.youtube.com/playlist?list=${pl.id}`,
                title: pl.snippet.title ?? "",
                description: pl.snippet.description ?? "",
                publishedAt: new Date(pl.snippet.publishedAt ?? ""),
                numOfVids: pl.contentDetails.itemCount ?? 0,
                thumbnailUrl: pl.snippet.thumbnails.maxres?.url ?? "",
            };
            return playlist;
        })
        .filter((pl) => pl !== undefined);

    return playlistObjs;
}
