#!/usr/bin/env node
import * as http from "http";
import * as debug from "debug";

import { app } from "../app";
import { connectServer } from "../middleware/db";

app.set("port", normalizePort(process.env.PORT || "3000"));
app.set("dbport", normalizePort(process.env.PORT || "27017"));
app.set("host", "localhost");
app.set("dbname", "gms-db");
var server = http.createServer(app);

server.listen(app.get("port"), () => { console.log("Server listening at http://" + app.get("host") + ":" + app.get("port")); });
server.on("error", onError);
server.on("listening", onListening);

connectServer(app.get("host"), app.get("dbport"), app.get("dbname"));

function normalizePort(val: any): number | boolean {
	var port = parseInt(val, 10);
	if (isNaN(port)) { return val; }
	if (port >= 0) { return port; }
	return false;
}

function onError(error: any): void {
	if (error.syscall !== "listen") { throw error; }
	// handle specific listen errors with friendly messages
	switch (error.code) {
		case "EACCES":
			console.error(app.get("port") + " requires elevated privileges");
			process.exit(1);
			break;
		case "EADDRINUSE":
			console.error(app.get("port") + " is already in use");
			process.exit(1);
			break;
		default:
			throw error;
	}
}

function onListening(): void {
	var addr = server.address();
	//@ts-ignore
	var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
	debug("Listening on " + bind);
}
