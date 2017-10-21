"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = require("chalk");
const fs = require("fs");
const glob = require("glob");
const util_1 = require("util");
const parser_1 = require("./parser");
const GLOB_PATH = process.argv[2] || '**/*.feature';
const readfileAsync = util_1.promisify(fs.readFile);
async function main() {
    const cucumber = new parser_1.CucumberParser();
    glob(GLOB_PATH, (err, matches) => {
        if (matches.length > 0) {
            matches.forEach(async (file) => {
                const fileContent = await readfileAsync(file);
                const doc = cucumber.parse(fileContent.toString());
                const pickles = cucumber.compile(doc);
            });
        }
        else {
            console.log(chalk_1.default.red('No files found'));
        }
    });
}
main();
//# sourceMappingURL=index.js.map