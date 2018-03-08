const read = require("read");

function getPassword(confirm = false) {
    const getPass = (shouldConfirm, firstPass) => {
        return new Promise((resolve, reject) => {
            const message = shouldConfirm ? "Password (confirm): " : "Password: ";
            read({ prompt: message, silent: true }, function(err, password) {
                if (err) {
                    return reject(err);
                }
                if (confirm && !shouldConfirm) {
                    return getPass(true, password).then(resolve, reject);
                }
                if (shouldConfirm && password !== firstPass) {
                    return reject(new Error("Passwords don't match"));
                }
                resolve(password);
            });
        });
    };
    return getPass(false);
}

module.exports = {
    getPassword
};
