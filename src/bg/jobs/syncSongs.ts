import { JobStatusFile } from "@/types/types.js";
import { downloadSong } from "@/utils/downloadSong.js";
import { mkdir, writeFile } from "fs/promises";
import { workerData } from "worker_threads";

// this file will be executed after a req to /playlist/sync is made
// it will download the songs locally on the server using yt-dlp
// then the user will get their data after a req to /vid/:jobId/batch or /vid/:jobId/:songId

console.log("i'm a bee worker, i just started working! 🐝🐝");

console.log(workerData.localVideoIds);

const jobName = workerData.jobName as string;
const allVidIds = workerData.allVidIds as string[];
const localVideoIds = workerData.localVideoIds as string[];
const localIdSet = new Set(localVideoIds);

const diffVidIds = allVidIds.filter((id) => !localIdSet.has(id));

const statusFile: JobStatusFile = {
    status: "processing",
    numOfVids: diffVidIds.length,
    createdAt: Date.now(),
};
// making dir
await mkdir(`/tmp/${jobName}/`);
// making status.json file
await writeFile(`/tmp/${jobName}/status.json`, JSON.stringify(statusFile));

// parallel downloading

await Promise.all(
    diffVidIds.map(async (id) => {
        await downloadSong(id, `/tmp/${jobName}/`);
    })
);

const newStatusFile = {
    ...statusFile,
    status: "done",
    finishedAt: Date.now(),
    toBeDeletedAt: Date.now() + 1000 * 60 * 60 * 24, // after 1 day of finishing
};

await writeFile(`/tmp/${jobName}/status.json`, JSON.stringify(newStatusFile));
