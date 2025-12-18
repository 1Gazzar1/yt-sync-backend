import { exec } from "child_process";
import { URL } from "url";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function getVidIdFromMetadata(path: string) {
    const { stderr } = await execAsync(`ffprobe  "${path}"`);

    const urlMatch = stderr.match(/https?:\/\/[^\s]+/) ?? "";
    const url = new URL(urlMatch);

    return url.searchParams.get("v");
}
