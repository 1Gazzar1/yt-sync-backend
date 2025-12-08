export type Playlist = {
    id: string;
    url: `https://www.youtube.com/playlist?list=${string}`;
    publishedAt: Date;
    title: string;
    description: string;
    thumbnailUrl: string;
    numOfVids: number;
};

export type Video = {
    title: string;
    size: string;
    thumbnail: string;
};

export type JobStatusFile = {
    status: "done" | "processing";
    numOfVids: number;
    createdAt: number;
    toBeDeletedAt?: number;
    finishedAt?: number;
};
