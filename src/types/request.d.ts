import "express";
import { Credentials } from "./types";
declare module "express-serve-static-core" {
    interface Request {
        user?: {
            name: string;
            email: string;
            profile: string;
        };
        token?: string; // id token (jwt)
        credentials?: Credentials;
    }
}
