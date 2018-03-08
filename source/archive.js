const { Archive, TextDatasource, createCredentials } = require("buttercup");

function changePassword(archive, password) {
    const systemGroup = archive.findGroupsByTitle("system")[0];
    const loginEntry = systemGroup.findEntriesByProperty("title", "masterpassword")[0];
    loginEntry.setProperty("password", password);
}

function getArchive(encrypted, password) {
    const datasource = new TextDatasource(encrypted);
    return datasource.load(createCredentials.fromPassword(password));
}

function initialiseArchive(password) {
    const archive = new Archive();
    const systemGroup = archive.createGroup("system");
    const loginEntry = systemGroup.createEntry("masterpassword");
    loginEntry.setProperty("password", password);
    archive.createGroup("accounts");
    const datasource = new TextDatasource();
    return datasource.save(archive, createCredentials.fromPassword(password));
}

function saveArchive(archive) {
    const systemGroup = archive.findGroupsByTitle("system")[0];
    const loginEntry = systemGroup.findEntriesByProperty("title", "masterpassword")[0];
    const password = loginEntry.getProperty("password");
    const datasource = new TextDatasource();
    return datasource.save(archive, createCredentials.fromPassword(password));
}

module.exports = {
    changePassword,
    getArchive,
    initialiseArchive,
    saveArchive
};
