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
const readfileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);
class Main {
    /**
     * Takes feature files, matches steps to a step definition file and outputs parsed templates
     *
     * @param GLOB_PATH Glob path used to retrieve all feature files to parse
     * @param STEPS_FILE Steps file used to match gherkin keywords to steps
     * @param PATH_OUT_DIR Out directory where parsed spec files are put
     * @param TEMPLATE_FILE Template file used to output files
     */
    constructor(GLOB_PATH, STEPS_FILE, PATH_OUT_DIR, TEMPLATE_FILE) {
        this.GLOB_PATH = GLOB_PATH;
        this.STEPS_FILE = STEPS_FILE;
        this.PATH_OUT_DIR = PATH_OUT_DIR;
        this.TEMPLATE_FILE = TEMPLATE_FILE;
        // nothing needed
    }
    async run() {
        let stepsFile;
        let templateFile;
        try {
            stepsFile = await readfileAsync(this.STEPS_FILE);
            templateFile = await readfileAsync(this.TEMPLATE_FILE);
            this._cucumber = new parser_1.default();
            this._template = new template_1.default(templateFile.toString());
            // create steps in vm context
            vm.runInNewContext(stepsFile.toString(), sandbox_1.default);
        }
        catch (exception) {
            console.error(exception);
            process.exit(1);
        }
        const filePaths = await this._readGlob();
        filePaths.forEach(async (filePath) => {
            try {
                const { doc, pickles } = await this._parseFeatureFiles(filePath);
                if (!util.isNullOrUndefined(doc.feature)) {
                    const specFile = this._createSpecFile(doc, pickles);
                    await this._writeSpecFile(doc.feature.name, specFile);
                }
            }
            catch (exception) {
                console.error(exception);
                process.exit(1);
            }
        });
    }
    async _readGlob() {
        return new Promise((res, rej) => {
            glob(this.GLOB_PATH, { ignore: 'node_modules/**' }, (err, matches) => {
                if (matches.length > 0) {
                    res(matches);
                }
                else {
                    rej('No files found');
                }
            });
        });
    }
    /**
     * Parses feature files using Gherkin
     * @param featureFilePath Feature file
     */
    async _parseFeatureFiles(featureFilePath) {
        const fileContent = await readfileAsync(featureFilePath);
        return this._cucumber.parse(fileContent.toString());
    }
    /**
     * Takes a `GherkinDocument` and `Pickle`s, to translate it to a model used for templating
     * @param doc Parsed feature file
     * @param pickles Pickled Gherkin Document
     */
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
                })),
                type: pickle.type
            };
            return [...model, scenarioModel];
        }, []);
        return this._template.create(templateModel);
    }
    /**
     * Takes a `PickleStep` and matches it's type and text against the `StepsSandbox`.
     * It will then return a function with replaced values.
     *
     * Functions in the `StepsSandbox` have the following interface:
     * ```
     * Keyword(regex, func)
     * ```
     *
     * Values that are replaced are `$1`, `$2`, etc. These values should match the regex value.
     *
     * @param pickle Current step
     */
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
             * If the function is a `Function` take the inner code without `() => { }` or `function() { }`
             */
            func = func.replace(/(^.*?\{|\}$)/g, '').trim();
            /**
             * Replace $1, $2, etc with regex matches
             */
            const [, ...matches] = regexMatches;
            matches.forEach((match, index) => {
                func = func.replace(new RegExp('\\$' + (index + 1), 'g'), match);
            });
        }
        return func;
    }
    /**
     * Takes a file name and a created template to write to the file system
     *
     * @param fileName File name
     * @param specFile parsed template string
     */
    _writeSpecFile(fileName, specFile) {
        fileName = fileName.replace(/\s/g, '_');
        const specPath = this.PATH_OUT_DIR;
        try {
            fs.statSync(specPath);
        }
        catch (_a) {
            fs.mkdirSync(specPath);
        }
        return writeFileAsync(path.join(specPath, fileName + '.js'), specFile);
    }
}
exports.Main = Main;
//# sourceMappingURL=main.js.map