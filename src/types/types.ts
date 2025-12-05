export type Playlist = {
    id: string;
    url: `https://www.youtube.com/playlist?list=${string}`;
    publishedAt: Date;
    title: string;
    description: string;
    thumbnailUrl: string;
    numOfVids: number;
};

export type Video = {};

export type ResponseType = {
    data: Playlist[] | Video[];
    tokens: Credentials;
};

export type RequestBodyType = {
    refresh_token: string;
    access_token: string;
    expiry_date: number;
    [prop: string]: any;
};

export type Credentials = {
    refresh_token?: string;
    access_token?: string;
    scope?: string;
    token_type?: string;
    id_token?: string;
    expiry_date?: number;
};
