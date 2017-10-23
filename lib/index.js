"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const glob = require("glob");
const path = require("path");
const util = require("util");
const vm = require("vm");
const parser_1 = require("./parser");
const sandbox_1 = require("./sandbox");
const template_1 = require("./template");
const GLOB_PATH = process.argv[2] || '**/*.feature';
const STEPS_FILE = process.argv[3] || 'sample/steps.js';
const FEATURE_FILES_PATH = process.argv[4] || 'specs/';
const TEMPLATE_FILE = path.join(__dirname, '../templates/specfile.hbs');
const readfileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);
class Main {
    constructor() {
        // nothing needed
    }
    async run() {
        const stepsFile = await readfileAsync(STEPS_FILE);
        const templateFile = await readfileAsync(TEMPLATE_FILE);
        this._cucumber = new parser_1.default();
        this._template = new template_1.default(templateFile.toString());
        // create steps in vm context
        vm.runInNewContext(stepsFile.toString(), sandbox_1.default);
        const filePaths = await this._readGlob();
        filePaths.forEach(async (filePath) => {
            const { doc, pickles } = await this._parseFeatureFiles(filePath);
            const specFile = this._createSpecFile(doc, pickles);
            await this._writeSpecFile(doc.feature.name, specFile);
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
        const templateModel = {
            feature: doc.feature.name,
            scenarios: []
        };
        templateModel.scenarios = pickles.reduce((model, pickle) => {
            const scenarioModel = {
                name: pickle.name,
                steps: pickle.steps.map((p) => ({
                    func: this._mapStepFunc(p),
                    text: `${p.type} ${p.text}`
                }))
            };
            return [...model, scenarioModel];
        }, []);
        return this._template.create(templateModel);
    }
    _mapStepFunc(pickle) {
        const definitions = sandbox_1.default.get(pickle.type);
        const def = definitions.find((f) => f.regex.test(pickle.text));
        if (!def) {
            return null;
        }
        const regexMatches = pickle.text.match(def.regex);
        let func = def.func;
        if (regexMatches) {
            /**
             * Replace $1, $2, with all regex matches
             */
            const [, ...matches] = regexMatches;
            matches.forEach((match, index) => {
                func = func.replace('$' + (index + 1), match);
            });
        }
        return func;
    }
    _writeSpecFile(fileName, specFile) {
        fileName = fileName.replace(/\s/g, '_');
        const specPath = FEATURE_FILES_PATH;
        try {
            fs.statSync(specPath);
        }
        catch (_a) {
            fs.mkdirSync(specPath);
        }
        return writeFileAsync(path.join(specPath, fileName + '.js'), specFile);
    }
}
new Main().run();
//# sourceMappingURL=index.js.map