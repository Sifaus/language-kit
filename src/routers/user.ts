import * as express from "express";
import { check, ValidationError, Result, validationResult } from "express-validator";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";

import * as UserModel from "../models/user";
import { app } from "../app";

export var userRouter = express.Router();

userRouter.post(
	"/signup",
	[
		check("username", "Username cannot be empty. ").trim().escape().not().isEmpty(),
		check("email", "Enter a valid E-mail. ").isEmail().normalizeEmail(),
		check("password", "Password must be at least 6 characters. ").trim().escape().isLength({ min: 6 }),
		check("passwordrepeat").trim().escape().isLength({ min: 6 }).custom((value, { req }) => {
			if (value !== req.body.password) { throw new Error("Password confirmation does not match password. "); }
			return true;
		})
	],
	async (req: express.Request, res: express.Response) => {
		const errors: Result<ValidationError> = validationResult(req);
		if (!errors.isEmpty()) { return res.status(400).json({ errors: errors.array() }); }

		const { username, email, password } = req.body;

		try {
			const userE: any = await UserModel.user.findOne({ email });
			if (userE) { return res.status(400).json({ error: "E-Mail Already Exists. " }); }

			const userU: any = await UserModel.user.findOne({ username });
			if (userU) { return res.status(400).json({ error: "Username Already Exists. " }); }

			const role: string = "user";
			const user: any = new UserModel.user({ username, email, password, role });

			const salt: string = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(password, salt);

			await user.save();

			const payload: object = { user: { id: user.id } };

			jwt.sign(
				payload,
				app.get("privateKey"),
				{ expiresIn: "4h" },
				(err, token) => {
					if (err) { throw err; }
					res.status(200)
						.clearCookie("access_token")
						.cookie("access_token", token, {
							secure: true,
							httpOnly: true,
							sameSite: true,
							expires: new Date(Date.now() + 4 * 60 * 60 * 100)
						}).send({ t: "user-signup", m: "ok" });
				}
			);
		}
		catch (err) {
			console.error(err.message);
			res.status(500).send({ servererror: "Error while saving the account. " });
		}
	}
);

userRouter.post(
	"/login",
	[
		check("username", "Username cannot be empty. ").trim().escape().not().isEmpty(),
		check("password", "Password must be at least 6 characters. ").trim().escape().not().isEmpty().isLength({ min: 6 })
	],
	async (req: express.Request, res: express.Response) => {
		const errors: Result<ValidationError> = validationResult(req);
		if (!errors.isEmpty()) { return res.status(400).json({ errors: errors.array() }); }

		const { username, password } = req.body;

		try {
			const user: any = await UserModel.user.findOne({ username });
			if (!user) { return res.status(400).json({ error: "Username does not exist. " }); }

			const isMatch: boolean = await bcrypt.compare(password, user.password);
			if (!isMatch) { return res.status(400).json({ error: "Incorrect Password. " }); }

			const payload: any = { user: { id: user.id } };

			jwt.sign(
				payload,
				app.get("privateKey"),
				{ expiresIn: "4h" },
				(err, token) => {
					if (err) { throw err; }
					res.status(200)
						.clearCookie("access_token")
						.cookie("access_token", token, {
							secure: true,
							httpOnly: true,
							sameSite: "strict",
							expires: new Date(Date.now() + 4 * 60 * 60 * 100)
						}).send({ username: user.username, t: "user-login", m: "ok" });
				}
			);
		}
		catch (e) {
			console.error(e);
			res.status(500).json({ servererror: "Server error. " });
		}
	}
);

userRouter.post(
	"/auth",
	[],
	async (req: express.Request, res: express.Response) => {
		const errors: Result<ValidationError> = validationResult(req);
		if (!errors.isEmpty()) { return res.status(400).json({ errors: errors.array() }); }

		const access_token: string = req.cookies["access_token"];
		const decoded: any = await jwt.decode(access_token, { complete: true });
		if (!decoded) { return res.status(400).json({ error: "No cookies exist. " }); }

		const _id: string = decoded.payload.user.id;

		try {
			const user: any = await UserModel.user.findOne({ _id });
			if (!user) { return res.status(400).clearCookie("access_token").json({ error: "No username has this ID. " }); }

			try {
				const isVerified: any = await jwt.verify(access_token, app.get("privateKey"));
				res.status(200).send({ username: user.username, t: "user-auth", m: "ok" });
			}
			catch (e) {
				console.error(e);
				res.status(400).clearCookie("access_token").json({ error: "Server error. " });
			}
		}
		catch (e) {
			console.error(e);
			res.status(500).clearCookie("access_token").json({ servererror: "Server error. " });
		}
	}
);

userRouter.post(
	"/logout",
	[],
	async (req: express.Request, res: express.Response) => {
		const errors: Result<ValidationError> = validationResult(req);
		if (!errors.isEmpty()) { return res.status(400).json({ errors: errors.array() }); }

		try {
			res.status(200).clearCookie("access_token").send({ t: "user-logout", m: "ok" });
		}
		catch (e) {
			console.error(e);
			res.status(500).clearCookie("access_token").json({ servererror: "Server error. " });
		}
	}
);

userRouter.post(
	"/languages",
	[],
	async (req: express.Request, res: express.Response) => {
		const errors: Result<ValidationError> = validationResult(req);
		if (!errors.isEmpty()) { return res.status(400).json({ errors: errors.array() }); }

		try {

		}
		catch (e) {
			console.error(e);
			res.status(500).clearCookie("access_token").json({ servererror: "Server error. " });
		}

	}
);