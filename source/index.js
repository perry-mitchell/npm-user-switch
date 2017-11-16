const minimist = require("minimist");
const { bold, cyan } = require("chalk");
const pruddy = require("pruddy-error");
const { initialiseConfig } = require("./config.js");
const { login } = require("./login.js");
const { displayMainMenu } = require("./menu.js");

const argv = minimist(process.argv.slice(2));

console.log(bold(cyan("NPM User Account Switcher")));

initialiseConfig()
    .then(login)
    .then(displayMainMenu)
    .catch(err => {
        console.error(pruddy(err));
        process.exit(1);
    });