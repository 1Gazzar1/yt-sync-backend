import { JobStatusFile } from "@/types/types.js";
import fs from "fs/promises";

async function getFolders() {
    const folders = (await fs.readdir(`/tmp/`)).filter(
        async (folder) =>
            folder.startsWith("job-") && (await fs.stat(folder)).isDirectory()
    );
    return folders;
}

async function deleteOldFolders(folders: string[]) {
    folders.forEach(async (folder) => {
        const statusFile: JobStatusFile = JSON.parse(
            (await fs.readFile(`/tmp/${folder}/status.json`)).toString()
        );
        const { toBeDeletedAt } = statusFile;
        if (toBeDeletedAt && toBeDeletedAt < Date.now()) {
            await fs.rmdir(`/tmp/${folder}`);
        }
    });
}

const jobFolders = await getFolders();

await deleteOldFolders(jobFolders);
