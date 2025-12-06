import Bree from "bree";
import path from "path";
import { randomBytes } from "crypto";
import { ERRORS } from "@/errors/error.js";

const bree = new Bree({
    root: false,
    jobs: [
        // {
        //     name: "download playlist",
        //     path: path.resolve("dist/bg/jobs/syncSongs.js"),
        // },
        {
            name: "clean up tmp folder",
            path: path.resolve("@/bg/jobs/cleanup.js"),
            cron: "0 0 * * *",
        },
    ],
});

// util functions for scheduling jobs

export async function scheduleBreeSyncPlaylistJob(
    playlistId: string,
    localVideoIds: string[]
) {
    const p = path.resolve("dist/bg/jobs/syncSongs.js");

    await scheduleBreeJob(p, {
        playlistId,
        localVideoIds,
    });
}

async function scheduleBreeJob(path: string, workerData: any) {
    const randomChars = randomBytes(4).toString("hex");
    const jobName = `job-${randomChars}`;
    try {
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
    } catch (error) {
        throw ERRORS.INTERNAL(
            `scheduling job failed, message:${(error as Error).message}`
        );
    }
}

export default bree;
