const { red, white, green, dim } = require("chalk");
const { star } = require("figures");
const minimist = require("minimist");
const { getConfig } = require("./config.js");
const { getPassword } = require("./input.js");
const { getArchive, initialiseArchive } = require("./archive.js");
const { renderMenu } = require("./menu.js");
const { startServer, stopServer } = require("./server.js");

const { version } = require("../package.json");
const argv = minimist(process.argv.slice(2));

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

if (argv.bg) {
    const { timeout: timeoutRaw } = argv;
    const timeout = parseInt(timeoutRaw, 10);
    if (!timeout || timeout <= 0) {
        console.error(`Invalid timeout value: ${timeoutRaw}`);
        process.exit(2);
    }
    startServer()
        .then(() => {})
        .catch(err => {
            console.error("Failed starting service");
            console.error(err);
            process.exit(3);
        });
} else if (!getConfig().get("archive")) {
    prepareArchive()
        .then(openArchive)
        .catch(handleError);
} else {
    openArchive().catch(handleError);
}
