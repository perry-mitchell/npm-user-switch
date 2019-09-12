const path = require("path");
const fs = require("fs");
const pify = require("pify");
const getPort = require("get-port");
const express = require("express");
const bodyParser = require("body-parser");
const { initialiseDaemon } = require("./background.js");

const readFile = pify(fs.readFile);
const unlinkFile = pify(fs.unlink);
const writeFile = pify(fs.writeFile);

const portFilename = path.resolve(__dirname, "../.prtnbr");

let __app,
    __server,
    __backgroundDaemon = null;

function findNewPort() {
    return getExistingPort()
        .then(port => {
            if (port) {
                throw new Error("Server already running");
            }
            return getPort();
        })
        .then(port => {
            return writeFile(portFilename, `${port}`).then(() => port);
        });
}

function getExistingPort() {
    return readFile(portFilename, "utf8")
        .then(contents => {
            return parseInt(contents.trim(), 10) || null;
        })
        .catch(() => {
            return null;
        });
}

function removePortFile() {
    return unlinkFile(portFilename);
}

function setupRoutes(app) {
    app.post("/configure", (req, res) => {
        if (__backgroundDaemon) {
            res.status(400).send("Bad Request");
            return;
        }
        const { password } = req.body;
        __backgroundDaemon = initialiseDaemon(password);
        res.set("Content-Type", "application/json").send(
            JSON.stringify({
                status: "ok"
            })
        );
    });
}

function startServer() {
    return findNewPort().then(port => {
        __app = express();
        __app.use(bodyParser.json());
        setupRoutes(__app);
        __server = __app.listen(port);
    });
}

function stopServer() {
    return new Promise(resolve => {
        __server.close(resolve);
    });
}

module.exports = {
    startServer,
    stopServer
};
