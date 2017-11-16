const { getArchive } = require("./config.js");

function getEntries() {
    return getArchive()
        .then(archive => {
            const [rootGroup] = archive.findGroupsByTitle("root");
            return rootGroup.getEntries();
        });
}

module.exports = {
    getEntries
};
