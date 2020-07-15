import * as path from "path";
import * as express from "express";
import * as cookieParser from "cookie-parser";
import * as bodyParser from "body-parser";
import * as logger from "morgan";

import { indexRouter } from "./routers/index";
import { userRouter } from "./routers/user";
import { langkitRouter } from "./routers/langkit";

export const app: express.Application = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set("privateKey", "pyszoAooFSPX-hmjPo3IZFuxqy-i9SQc98OWVs7tf_eIQPu7zHmRvHorxPqzMOd8js4fSg1Mj4yOTFDmFuBBOA");

app.set("publicPath", path.join(__dirname, "public"));
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/user", userRouter);
app.use("/langkit", langkitRouter);

