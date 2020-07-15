import * as express from "express";
import { check, ValidationError, Result, validationResult } from "express-validator";
import * as jwt from "jsonwebtoken";

import * as LangModel from "../models/lang";
import * as UserModel from "../models/user";
import { app } from "../app";

export var langkitRouter = express.Router();

langkitRouter.post(
	"/save",
	[
		check("langname", "Language name cannot be empty. ").trim().escape().not().isEmpty(),
		check("constants.*", "").trim().escape(),
		check("constantfrequency.*", "").trim().escape(),
		check("vowels.*", "").trim().escape(),
		check("vowelfrequency.*", "").trim().escape(),
		check("diphtongs.*", "").trim().escape(),
		check("diphtongfrequency.*", "").trim().escape(),
		check("digraphs.*", "").trim().escape(),
		check("digraphfrequency.*", "").trim().escape(),
		check("syllables.*", "").trim().escape(),
		check("syllablefrequency.*", "").trim().escape(),
		check("prefixes.*", "").trim().escape(),
		check("wordlength.*", "").trim().escape(),
		check("repeatedletters", "Repeated Letters must be boolean. ").toBoolean().isBoolean(),
		check("spaceafterprefix", "Space After Prefix must be boolean. ").toBoolean().isBoolean(),
		check("autocapitalization", "Auto Capitalization must be boolean. ").toBoolean().isBoolean()
	],
	async (req: express.Request, res: express.Response) => {
		const errors: Result<ValidationError> = validationResult(req);
		if (!errors.isEmpty()) { return res.status(400).json({ errors: errors.array() }); }

		const access_token: string = req.cookies["access_token"];
		const decoded: any = await jwt.decode(access_token, { complete: true });
		if (!decoded) { return res.status(400).json({ error: "No cookies exist. " }); }

		const _id: string = decoded.payload.user.id;

		const {
			langname,
			constants, constantfrequency,
			vowels, vowelfrequency,
			diphtongs, diphtongfrequency,
			digraphs, digraphfrequency,
			syllables, syllablefrequency,
			prefixes,
			wordlength,
			repeatedletters,
			spaceafterprefix,
			autocapitalization
		} = req.body;

		try {
			const user: any = await UserModel.user.findOne({ _id });
			if (!user) { return res.status(400).clearCookie("access_token").json({ error: "No username has this ID. " }); }

			// TODO: Check if user has another lang with the same name too!

			const username = user.username;
			const isVerified: any = await jwt.verify(access_token, app.get("privateKey"));

			const lang: any = new LangModel.language({
				username,
				langname,
				constants, constantfrequency,
				vowels, vowelfrequency,
				diphtongs, diphtongfrequency,
				digraphs, digraphfrequency,
				syllables, syllablefrequency,
				prefixes,
				wordlength,
				repeatedletters,
				spaceafterprefix,
				autocapitalization
			});

			await lang.save();

			res.status(200).send({ t: "lang-save", m: "ok" });
		}
		catch (err) {
			console.error(err.message);
			res.status(500).send({ servererror: "Error while saving the account. " });
		}
	}
);