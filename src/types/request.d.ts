import "express";
import { Credentials } from "./types";
declare module "express-serve-static-core" {
    interface Request {
        access_token?: string; 
        id_token?: string; // id token (jwt)
    }
}
