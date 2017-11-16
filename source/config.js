const { Archive, TextDatasource, createCredentials } = require("buttercup");
const Conf = require("conf");
const { bold } = require("chalk");
const { getPassword } = require("./prompt.js");

const DEFAULTS = {
    archive: null
};

let __config,
    __datasource,
    __archive;

function getArchive(password) {
    if (!__archive) {
        if (!password) {
            return Promise.reject(new Error("No password available when getting entries"));
        }
        return __datasource
            .load(createCredentials.fromPassword(password))
            .then(archive => {
                __archive = archive;
                return archive;
            });
    }
    return Promise.resolve(__archive);
}

function getConfig() {
    if (!__config) {
        __config = new Conf({
            defaults: DEFAULTS,
            configName: "npm-user-switch"
        });
    }
    return __config;
}

function initialiseConfig() {
    const config = getConfig();
    const archiveContents = config.get("archive");
    if (!archiveContents) {
        console.log("Accounts configuration doesn't exist: Creating...");
        const archive = new Archive();
        archive.createGroup("root");
        console.log(`Please enter your ${bold("master")} password to use when switching accounts:`);
        return getPassword(true)
            .then(password => {
                console.log("Encrypting configuration...");
                const tds = new TextDatasource("");
                return tds
                    .save(archive, createCredentials.fromPassword(password))
                    .then(encryptedContent => {
                        config.set("archive", encryptedContent);
                        __datasource = new TextDatasource(encryptedContent);
                        console.log("Configuration setup has been completed");
                    });
            });
    }
    __datasource = new TextDatasource(archiveContents);
    return Promise.resolve();
}

module.exports = {
    getArchive,
    getConfig,
    initialiseConfig
};
