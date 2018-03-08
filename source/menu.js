const fs = require("fs");
const inquirer = require("inquirer");
const execa = require("execa");
const initNPMConf = require("npm-conf");
const pify = require("pify");
const eol = require("eol");
const { play } = require("figures");
const { green, underline } = require("chalk");
const { getPassword } = require("./input.js");
const { saveArchive } = require("./archive.js");
const { getConfig } = require("./config.js");

const readFile = pify(fs.readFile);
const writeFile = pify(fs.writeFile);

function renderAddAccount(archive) {
    const npmConf = initNPMConf();
    const accountsGroup = archive.findGroupsByTitle("accounts")[0];
    console.log("Prompting for NPM login...");
    return execa("npm", ["login"], { stdio: "inherit" })
        .then(() => execa("npm", ["whoami"]))
        .then(res => res.stdout)
        .then(username => username.trim())
        .then(username => {
            const npmrcLocation = npmConf.get("userconfig");
            return readFile(npmrcLocation, "utf8")
                .then(rcContents => rcContents.split(eol.lf))
                .then(rcLines => rcLines.find(line => /:_authToken=/.test(line)))
                .then(registryAuth => {
                    const newEntry = accountsGroup.createEntry(username);
                    newEntry.setProperty("password", registryAuth);
                });
        })
        .then(() => {
            console.log("Saving new account...");
            return saveArchive(archive)
                .then(archiveContents => {
                    const config = getConfig();
                    config.set("archive", archiveContents);
                    config.save();
                });
        })
        .then(() => {
            console.log(green("Account saved"));
        });
}

function renderMenu(archive) {
    const accountsGroup = archive.findGroupsByTitle("accounts")[0];
    return inquirer
        .prompt([
            {
                type: "list",
                name: "action",
                message: "Select an account to log in to, or choose another action:",
                choices: [
                    ...accountsGroup.getEntries().map(entry => ({
                        name: ` ${play} ${entry.getProperty("title")}`,
                        value: `login:${entry.getID()}`
                    })),
                    { name: "Add account", value: "add" },
                    { name: "Exit", value: "exit" }
                ]
            }
        ])
        .then(({ action }) => {
            if (/^login:/.test(action)) {
                return switchAccount(archive, action.replace(/^login:/, ""));
            }
            switch (action) {
                case "add":
                    return renderAddAccount(archive).then(() => renderMenu(archive));
                case "exit":
                    console.log("Exiting...");
                    break;
                default:
                    throw new Error(`Unknown menu selection: ${action}`);
            }
        });
}

function switchAccount(archive, entryID) {
    console.log("Switching account...");
    const accountsGroup = archive.findGroupsByTitle("accounts")[0];
    const accountEntry = accountsGroup.findEntryByID(entryID);
    const registryLine = accountEntry.getProperty("password");
    const accountName = accountEntry.getProperty("title");
    const npmConf = initNPMConf();
    const npmrcLocation = npmConf.get("userconfig");
    return readFile(npmrcLocation, "utf8")
        .then(rcContents => rcContents.split(eol.lf))
        .then(rcLines => {
            const index = rcLines.findIndex(line => /:_authToken=/.test(line));
            if (index === -1) {
                console.log("No registry line found in config, appending...");
                rcLines.push(registryLine);
            } else {
                console.log("Replacing existing registry line in config...");
                rcLines[index] = registryLine;
            }
            return writeFile(npmrcLocation, rcLines.join(eol.lf));
        })
        .then(() => {
            console.log(`User changed to: ${accountName}`);
        });
}

module.exports = {
    renderMenu
};
