import express from "express";
import type { ErrorRequestHandler } from "express";
import { CustomError } from "./errors/error.js";
import { config } from "dotenv";
import authRouter from "./routers/authRouter.js";
import playlistRouter from "./routers/playlistRouter.js";
import vidRouter from "./routers/vidRouter.js";
import { verifyToken } from "@/middleware/authMiddleware.js";
import { folderExists } from "./middleware/vidMiddleware.js";

config();

const app = express();
const PORT = process.env.PORT;

app.use(express.json());

app.get("/", (req, res) => {
    console.log(req.method, req.host, req.hostname);
    res.json("Hello world");
});

// routers
app.use("/auth", authRouter);
app.use("/playlist",verifyToken, playlistRouter);
app.use("/vid", verifyToken, vidRouter);

app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
});

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    if (err instanceof CustomError) {
        const errMsg = `ERROR: ${err.name}\nSTATUS: ${err.statusCode}\nMESSAGE: ${err.message}`;
        res.status(err.statusCode).send(errMsg);
    } else {
        res.status(500).send(err.message || "INTERNAL ERROR");
    }
};

app.use(errorHandler);
