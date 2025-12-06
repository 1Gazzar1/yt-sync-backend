import Bree from "bree";
import path from "path";
import { randomBytes } from "crypto";
import { ERRORS } from "@/errors/error.js";
import cron from "cron-validate";

const bree = new Bree({
    root: false,
    jobs: [
        // {
        //     name: "download playlist",
        //     path: path.resolve("dist/bg/jobs/syncSongs.js"),
        // },
        {
            name: "clean up tmp folder",
            path: path.resolve("dist/bg/jobs/cleanup.js"),
            interval: "1d",
            timeout: "at 12:00 am",
        },
    ],
});

// util functions for scheduling jobs

export async function scheduleBreeSyncPlaylistJob(
    allVidIds: string[],
    localVideoIds: string[]
) {
    const p = path.resolve("dist/bg/jobs/syncSongs.js");

    await scheduleBreeJob(p, {
        allVidIds,
        localVideoIds,
    });
}

async function scheduleBreeJob(path: string, workerData: any) {
    const randomChars = randomBytes(4).toString("hex");
    const jobName = `job-${randomChars}`;

    await bree.add({
        name: jobName,
        path,
        worker: {
            workerData: {
                jobName,
                ...workerData,
            },
        },
    });
    bree.run(jobName);
}

export default bree;
