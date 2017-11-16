const { bold } = require("chalk");
const { getPassword } = require("./prompt.js");
const { getArchive } = require("./config.js");

function login() {
    console.log(`${bold("Login")} to switch accounts:`);
    // const password = getPassword();
    // console.log("Decrypting accounts configuration...");
    // return getArchive(password).then(() => {});
    return getPassword()
        .then(password => {
            console.log("Decrypting accounts configuration...");
            return getArchive(password).then(() => {});
        });
}

module.exports = {
    login
};
