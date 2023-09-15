const fs = require("fs");
const path = require("path");

const files = fs
    .readdirSync(path.resolve(__dirname))
    .filter(file => file.endsWith(".js") && file !== "index.js");

const utils = {};

for (const file of files) {
    utils[file.replace(/\.js/g, "")] = require(`./${file}`);
}

module.exports = utils;