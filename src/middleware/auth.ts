import * as express from "express";
import * as jwt from "jsonwebtoken";

export function auth(req: any, res: express.Response, next: express.NextFunction) {
	const token = req.header("token");
	if (!token) return res.status(401).json({ message: "Auth Error" });

	try {
		const decoded: any = jwt.verify(token, "randomString");
		req.user = decoded.user;
		next();
	}
	catch (e) {
		console.error(e);
		res.status(500).send({ message: "Invalid Token" });
	}
};