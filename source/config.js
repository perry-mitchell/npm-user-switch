const createConfig = require("user-config");

const TEMPLATE = {
    archive: null
};

let __config;

function getConfig() {
    if (!__config) {
        __config = createConfig("npm-user-switch", TEMPLATE);
    }
    return __config;
}

module.exports = {
    getConfig
};
