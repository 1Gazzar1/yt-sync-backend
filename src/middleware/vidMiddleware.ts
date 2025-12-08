import { ERRORS } from "@/errors/error.js";
import { NextFunction, Request, Response } from "express";
import fs from "fs";
import path from "path";

export function folderExists(req: Request, res: Response, next: NextFunction) {
    // make sure that a folder exists with the name of /tmp/job-${jobId}/
    const jobId = req.params.jobId;

    if (!jobId) throw ERRORS.BAD_REQUEST("jobId not there");
    const p = path.resolve(`/tmp/job-${jobId}/`);
    try {
        fs.existsSync(p);
        next();
    } catch (error) {
        throw ERRORS.BAD_REQUEST("jobId is wrong, job folder doesn't exist");
    }
}
