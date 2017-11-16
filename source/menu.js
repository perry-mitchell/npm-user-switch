const Menu = require("terminal-menu");
const { getEntries } = require("./entries.js");

function displayMainMenu() {
    return getEntries()
        .then(entries => {
            const menu = Menu({ width: 30, x: 4, y: 2 });
            menu.reset();
            menu.write("NPM User Account Switcher\n");
            menu.write("-------------------------\n");
            entries.forEach(entry => {
                menu.add(`Login: ${entry.getProperty("title")}`);
            });
            menu.add("Add account");
            menu.add("Delete account");
            menu.add("Logout");
            menu.add("Purge");
            menu.add("Exit");
            return new Promise((resolve, reject) => {
                menu.on("select", function (label) {
                    menu.close();
                    console.log('SELECTED: ' + label);
                });
                process.stdin.pipe(menu.createStream()).pipe(process.stdout);
                process.stdin.setRawMode(true);
                menu.on("close", function () {
                    process.stdin.setRawMode(false);
                    process.stdin.end();
                    resolve();
                });
            });
        });
}

module.exports = {
    displayMainMenu
};
