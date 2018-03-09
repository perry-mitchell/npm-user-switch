const { red, white, green, dim } = require("chalk");
const { star } = require("figures");
const { getConfig } = require("./config.js");
const { getPassword } = require("./input.js");
const { getArchive, initialiseArchive } = require("./archive.js");
const { renderMenu } = require("./menu.js");

const { version } = require("../package.json");

console.log(` ${white(star)}  ${red("NPM User Switch")} ${dim(`v${version}`)}`);

function handleError(err) {
    console.error(`A fatal error has occurred: ${err.message}`);
    process.exit(1);
}

function openArchive() {
    const archiveContents = getConfig().get("archive");
    console.log("Enter your master password to switch accounts:");
    return getPassword()
        .then(password => getArchive(archiveContents, password))
        .then(archive => renderMenu(archive));
}

function prepareArchive() {
    console.log("No records exist for account storage: We'll create them now...");
    console.log("Choose a master password for switching accounts:");
    return getPassword(/* confirm: */ true)
        .then(password => initialiseArchive(password))
        .then(archiveString => {
            const config = getConfig();
            config.set("archive", archiveString);
            config.save();
            console.log(green("Local encrypted archive created"));
        });
}

if (!getConfig().get("archive")) {
    prepareArchive()
        .then(openArchive)
        .catch(handleError);
} else {
    openArchive().catch(handleError);
}
