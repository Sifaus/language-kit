import * as mongoose from "mongoose";

export function connectServer(host: string, dbport: string, dbname: string): mongoose.Connection {
	mongoose.connect("mongodb://" + host + ":" + dbport + "/" + dbname, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	}).then((f) => {
		console.log("MESSAGE: Connected to the database.");
	}, function (e) {
		console.log("MESSAGE: Failed to connect to the database.");
	});

	return mongoose.connection;
};

export function disconnectServer(connection: mongoose.Connection): void {
	connection.close();
};
