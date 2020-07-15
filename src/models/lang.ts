import * as mongoose from "mongoose";

const languageSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true
	},
	langname: {
		type: String,
		required: true
	},
	constants: {
		type: Array
	},
	constantfrequency: {
		type: Array
	},
	vowels: {
		type: Array
	},
	vowelfrequency: {
		type: Array
	},
	diphtongs: {
		type: Array
	},
	diphtongfrequency: {
		type: Array
	},
	digraphs: {
		type: Array
	},
	digraphfrequency: {
		type: Array
	},
	syllables: {
		type: Array
	},
	syllablefrequency: {
		type: Array
	},
	prefixes: {
		type: Array
	},
	wordlength: {
		type: Array
	},
	repeatedletters: {
		type: Boolean
	},
	spaceafterprefix: {
		type: Boolean
	},
	autocapitalization: {
		type: Boolean
	}
});

export var language = mongoose.model("language", languageSchema);
