import * as mongoose from "mongoose";

const userSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	password: {
		type: String,
		required: true
	},
	role: {
		type: String,
		required: true
	},
	createdAt: {
		type: Date,
		default: Date.now(),
		required: true
	}
});

export var user = mongoose.model("user", userSchema);
