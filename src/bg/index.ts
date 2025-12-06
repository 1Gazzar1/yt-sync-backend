import Bree from "bree";
import path from "path";

const bree = new Bree({
    root: false,
    jobs: [
        // {
        //     name: "download playlist",
        //     path: path.resolve("dist/bg/jobs/syncSongs.js"),
        // },
        // {
        //     name: "clean up tmp folder",
        //     path: "path.resolve("dist/bg/jobs/cleanup.js")",
        //     cron: "0 0 * * *",
        // },
    ],
});

export default bree;
