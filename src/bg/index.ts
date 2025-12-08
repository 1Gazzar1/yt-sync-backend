import Bree from "bree";
import path from "path";
import { ERRORS } from "@/errors/error.js";

const bree = new Bree({
    root: false,
    jobs: [
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
    jobName: string,
    allVidIds: string[],
    localVideoIds: string[]
) {
    const p = path.resolve("dist/bg/jobs/syncSongs.js");

    await scheduleBreeJob(jobName, p, {
        allVidIds,
        localVideoIds,
    });
}

async function scheduleBreeJob(jobName: string, path: string, workerData: any) {
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
            `scheduling job failed, error: ${(error as Error).message}`
        );
    }
}

export default bree;
