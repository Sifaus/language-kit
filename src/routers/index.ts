import * as path from "path";
import * as express from "express";

import { app } from "../app";

export var indexRouter = express.Router();

indexRouter.get("/", function (req: express.Request, res: express.Response, next: express.NextFunction) {
	res.sendFile(path.join(app.get("publicPath"), "index.html"));
});