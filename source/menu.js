const fs = require("fs");
const inquirer = require("inquirer");
const execa = require("execa");
const initNPMConf = require("npm-conf");
const pify = require("pify");
const eol = require("eol");
const { play, pointer } = require("figures");
const { green, yellow, gray, underline } = require("chalk");
const { getPassword } = require("./input.js");
const { changePassword, saveArchive } = require("./archive.js");
const { getConfig } = require("./config.js");

const readFile = pify(fs.readFile);
const writeFile = pify(fs.writeFile);

function addAcount(archive) {
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
            return saveArchive(archive).then(archiveContents => {
                const config = getConfig();
                config.set("archive", archiveContents);
                config.save();
            });
        })
        .then(() => {
            console.log(green("Account saved"));
        });
}

function changeArchivePassword(archive) {
    console.log("Enter a new master password:");
    return getPassword(/* confirm: */ true)
        .then(newPassword => changePassword(archive, newPassword))
        .then(() => {
            console.log("Changing password...");
            return saveArchive(archive).then(archiveContents => {
                const config = getConfig();
                config.set("archive", archiveContents);
                config.save();
            });
        });
}

function presentCurrentUser(archive) {
    const accountsGroup = archive.findGroupsByTitle("accounts")[0];
    const npmConf = initNPMConf();
    const npmrcLocation = npmConf.get("userconfig");
    return readFile(npmrcLocation, "utf8")
        .then(rcContents => rcContents.split(eol.lf))
        .then(rcLines => rcLines.find(line => /:_authToken=/.test(line)))
        .then(registryAuth => {
            const currentEntry = accountsGroup
                .getEntries()
                .find(entry => entry.getProperty("password") === registryAuth);
            const name = currentEntry ? currentEntry.getProperty("title") : "(unknown)";
            const colour = currentEntry ? yellow : gray;
            console.log(`Current account: ${colour(name)}`);
        });
}

function renameEntry(archive, entryID) {
    return inquirer
        .prompt([
            {
                type: "input",
                name: "name",
                message: "Enter new name:",
                validate: name => (name.trim().length > 0 ? true : "Please enter a name")
            }
        ])
        .then(({ name }) => {
            const accountsGroup = archive.findGroupsByTitle("accounts")[0];
            const accountEntry = accountsGroup.findEntryByID(entryID);
            accountEntry.setProperty("title", name);
            console.log("Saving changes...");
            return saveArchive(archive).then(archiveContents => {
                const config = getConfig();
                config.set("archive", archiveContents);
                config.save();
            });
        });
}

function renderMenu(archive) {
    const accountsGroup = archive.findGroupsByTitle("accounts")[0];
    return presentCurrentUser(archive)
        .then(() =>
            inquirer.prompt([
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
                        { name: "Change password", value: "change-password" },
                        { name: "Rename account", value: "rename" },
                        { name: "Exit", value: "exit" }
                    ]
                }
            ])
        )
        .then(({ action }) => {
            if (/^login:/.test(action)) {
                return switchAccount(archive, action.replace(/^login:/, ""));
            }
            switch (action) {
                case "add":
                    return addAcount(archive).then(() => renderMenu(archive));
                case "change-password":
                    return changeArchivePassword(archive).then(() => renderMenu(archive));
                case "rename":
                    return renderRenameMenu(archive).then(() => renderMenu(archive));
                case "exit":
                    console.log("Exiting...");
                    break;
                default:
                    throw new Error(`Unknown menu selection: ${action}`);
            }
        });
}

function renderRenameMenu(archive) {
    const accountsGroup = archive.findGroupsByTitle("accounts")[0];
    return inquirer
        .prompt([
            {
                type: "list",
                name: "action",
                message: "Select an account to rename:",
                choices: [
                    ...accountsGroup.getEntries().map(entry => ({
                        name: ` ${pointer} ${entry.getProperty("title")}`,
                        value: `rename:${entry.getID()}`
                    })),
                    { name: "Cancel", value: "cancel" }
                ]
            }
        ])
        .then(({ action }) => {
            if (/^rename:/.test(action)) {
                return renameEntry(archive, action.replace(/^rename:/, ""));
            }
            switch (action) {
                case "cancel":
                    // skip
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
            console.log(`User changed to: ${yellow(accountName)}`);
        });
}

module.exports = {
    renderMenu
};
