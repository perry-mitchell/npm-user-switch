// const prompt = require("password-prompt");
const prompt = require("prompt");
const pify = require("pify");

const getInput = pify(prompt.get);

function getPassword(confirm = false) {
    const schema = [{
        name: "Password",
        hidden: true,
        required: true,
        replace: "*"
    }];
    if (confirm) {
        schema.push({
            name: "Password (confirm)",
            hidden: true,
            required: true,
            replace: "*"
        });
    }
    return getInput(schema)
        .then(results => {
            console.log(results);
        });
    // return prompt("Password: ", { method: "mask" })
    //     .then(password => {
    //         if (confirm) {
    //             return prompt("Password (confirm): ", { method: "mask" })
    //                 .then(again => {
    //                     if (again !== password) {
    //                         console.log("Password's didn't match! Please try again...");
    //                         return getPassword(true);
    //                     }
    //                     return password;
    //                 });
    //         }
    //         return password;
    //     });
}

module.exports = {
    getPassword
};
