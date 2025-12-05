import type { Request, Response } from "express";
import { google, youtube_v3 } from "googleapis";
import { ERRORS } from "src/errors/error";
import type { Playlist } from "../types/types";
const oAuth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URL
);

export const getUserYTPlaylists = async (req: Request, res: Response) => {
    // const token = req.token;
    const { access_token, refresh_token } = req.body;

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
