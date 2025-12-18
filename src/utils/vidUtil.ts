import { createReadStream, createWriteStream } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { ERRORS } from "@/errors/error.js";
import { Response } from "express";
import archiver from "archiver";
import { getVidIdFromMetadata } from "./metadata.js";

export async function streamSong(
    writestream: Response,
    jobId: string,
    songId: string
) {
    // song id is the video id from yt
    const files = await getJobFiles(jobId);

    const file = files.find(async (file) => {
        const p = `/tmp/job-${jobId}/${file}`;

        const id = await getVidIdFromMetadata(p);
        if (!id)
            throw ERRORS.INTERNAL(
                `metadata faulty, failed to parse 'purl' metadata at ${p}`
            );

        return id === songId;
    });

    if (!file) throw ERRORS.BAD_REQUEST("songId doesn't exist in that folder");

    const finalPath = path.resolve(`/tmp/job-${jobId}/`, file);
    const rs = createReadStream(finalPath);

    rs.pipe(writestream);

    console.log(`✅ ${file}`);
}

export async function streamDirectoryOfSongs(
    writestream: Response,
    jobId: string
) {
    const archive = archiver("zip");

    archive.pipe(writestream);
    archive.directory(`/tmp/job-${jobId}/`, false);
    archive.finalize();
    console.log(`✅ job-${jobId}`);

    // for (const file of files) {
    //     const p = path.resolve(`/tmp/job-${jobId}/`, file);
    //     const stats = await fs.stat(p);

    //     if (stats.isDirectory())
    //         throw ERRORS.INTERNAL(
    //             `This isn't supposed to happen?\n directory found at ${p}`
    //         );

    //     const rs = createReadStream(p);

    //     // we need a promise so we finish writing the ReadSteam to the WriteStream first
    //     // so you don't write all 10 files at once, then it'll become corrupted

    //     await new Promise((resolve) => {
    //         rs.pipe(writestream, { end: false });
    //         rs.on("end", resolve as any);
    //     });

    //     console.log(`✅ ${file}`);
    // }
}
export async function getJobFiles(jobId: string) {
    const p = path.resolve(`/tmp/job-${jobId}/`);

    const files = await fs.readdir(p);
    return files.filter((file) => file !== "status.json");
}
