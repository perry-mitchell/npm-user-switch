const prompt = require("password-prompt");

function getPassword(confirm = false) {
    return prompt("Password: ", { method: "hide" })
        .then(password => {
            if (confirm) {
                return prompt("Password (confirm): ", { method: "hide" })
                    .then(again => {
                        if (again !== password) {
                            console.log("Password's didn't match! Please try again...");
                            return getPassword(true);
                        }
                        return password;
                    });
            }
            return password;
        });
}

module.exports = {
    getPassword
};
