import { downloadSong } from "@/utils/downloadSong.js";
import { mkdir, readFile, writeFile } from "fs/promises";
import { workerData } from "worker_threads";

console.log("i'm a bee worker, i just started working! 🐝🐝");

console.log(workerData.localVideoIds);

const jobName = workerData.jobName as string;
const allVidIds = workerData.allVidIds as string[];

console.log(allVidIds);
console.log(jobName);

const statusFile = {
    status: "processing",
    numOfVids: allVidIds.length,
};
// making dir
await mkdir(`/tmp/${jobName}/`);
// making status.json file
await writeFile(`/tmp/${jobName}/status.json`, JSON.stringify(statusFile));

// parallel downloading

await Promise.all(
    allVidIds.map(async (id) => {
        await downloadSong(id, `/tmp/${jobName}/`);
    })
);

const newStatusFile = {
    ...statusFile,
    status: "done",
};

await writeFile(`/tmp/${jobName}/status.json`, JSON.stringify(newStatusFile));
