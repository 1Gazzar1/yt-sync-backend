import { exec } from "child_process";

export async function downloadSong(url: string, path: string) {
    const id = new URLSearchParams(url).get("v");

    const { stdout, stderr } = await exec(
        `yt-dlp -x --audio-format mp3 
        --quiet 
        --add-metadata  --embed-thumbnail 
        -o "%(title)s.%(ext)s"
        -P ${path} 
        ${url}`
    );

    console.log("stdout:", stdout, "song id:", id);
    console.error("stderr:", stderr, "song id:", id);
}
