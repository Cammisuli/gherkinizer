"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const glob = require("glob");
const path = require("path");
const util = require("util");
const parser_1 = require("./parser");
const template_1 = require("./template");
const GLOB_PATH = process.argv[2] || '**/*.feature';
const STEPS_FILE = process.argv[3] || 'sample/steps.js';
const TEMPLATE_FILE = path.join(__dirname, '../templates/specfile.hbs');
const readfileAsync = util.promisify(fs.readFile);
class Main {
    constructor() {
        // nothing needed
    }
    async run() {
        const stepsFile = await readfileAsync(STEPS_FILE);
        const templateFile = await readfileAsync(TEMPLATE_FILE);
        this._cucumber = new parser_1.default();
        this._template = new template_1.default(templateFile.toString());
        const filePaths = await this._readGlob();
        filePaths.forEach(async (filePath) => {
            const { doc, pickles } = await this._parseFeatureFiles(filePath);
            const specFile = this._createSpecFile(doc, pickles);
            console.log(specFile);
        });
    }
    async _readGlob() {
        return new Promise((res, rej) => {
            glob(GLOB_PATH, (err, matches) => {
                if (matches.length > 0) {
                    res(matches);
                }
                else {
                    rej('No files found');
                }
            });
        });
    }
    async _parseFeatureFiles(featureFilePath) {
        const fileContent = await readfileAsync(featureFilePath);
        return this._cucumber.parse(fileContent.toString());
    }
    _createSpecFile(doc, pickles) {
        return this._template.create({ feature: doc.feature.name, scenarios: pickles });
    }
}
new Main().run();
//# sourceMappingURL=index.js.map