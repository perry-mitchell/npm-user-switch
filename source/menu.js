const Box = require("cli-box");
const createList = require("select-shell");
const { getEntries } = require("./entries.js");

function box(text) {
    const b = new Box(text);
    return b.toString();
}

function displayMainMenu() {
    return getEntries()
        .then(entries => {
            console.log(box("NPM User Account Switcher"));
            const list = createList({
                checked: "",
                unchecked: ""
            });
            var stream = process.stdin;
            entries.forEach(entry => {
                list.option(`Login: ${entry.getProperty("title")}`);
            });
            list.option("Exit");
            list.list();
            return new Promise((resolve, reject) => {
                list.on("select", options => {
                    console.log(options);
                    resolve();
                });
                list.on("cancel", function() {
                    resolve();
                });
            });
            // entries.forEach(entry => {
            //     menu.add(`Login: ${entry.getProperty("title")}`);
            // });
            // menu.add("Add account");
            // menu.add("Delete account");
            // menu.add("Logout");
            // menu.add("Purge");
            // menu.add("Exit");
            // return new Promise((resolve, reject) => {
            //     menu.on("select", function (label) {
            //         menu.close();
            //         console.log('SELECTED: ' + label);
            //     });
            //     process.stdin.pipe(menu.createStream()).pipe(process.stdout);
            //     process.stdin.setRawMode(true);
            //     menu.on("close", function () {
            //         process.stdin.setRawMode(false);
            //         process.stdin.end();
            //         resolve();
            //     });
            // });
        });
}

module.exports = {
    displayMainMenu
};
