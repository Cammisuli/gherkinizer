"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
const glob = require("glob");
const path = require("path");
const util = require("util");
const vm = require("vm");
const helpers_1 = require("./helpers");
const parser_1 = require("./parser");
const sandbox_1 = require("./sandbox");
const template_1 = require("./template");
const watcher_1 = require("./watcher");
class Gherkinizer {
    /**
     * Takes feature files, matches steps to a step definition file and outputs parsed templates
     *
     * @param GLOB_PATH Glob path used to retrieve all feature files to parse
     * @param STEPS Steps file used to match gherkin keywords to steps.
     * If creating step files, then this is the output directory
     * @param PATH_OUT_DIR Out directory where parsed spec files are put
     * @param TEMPLATE_FILE Template file used to output files
     */
    constructor(GLOB_PATH, STEPS, PATH_OUT_DIR, WATCH_MODE) {
        this.GLOB_PATH = GLOB_PATH;
        this.STEPS = STEPS;
        this.PATH_OUT_DIR = PATH_OUT_DIR;
        this.WATCH_MODE = WATCH_MODE;
        // nothing needed
    }
    /**
     * Creates step files by reading a common feature file. (Reusable scenarios)
     *
     * @param templateFilePath Path to template file used to create step files
     */
    async createSteps() {
        await this._start(path.join(__dirname, '../templates/stepfile.hbs'), true);
    }
    /**
     * Creates spec files by reading cucumber feature files.
     *
     * @param templateFilePath Path to the template file used to create spec files
     */
    async createSpecs() {
        await this._start(path.join(__dirname, '../templates/specfile.hbs'));
    }
    async _start(templateFilePath, steps = false) {
        try {
            await this._createTemplate(templateFilePath);
            const stepFileBuffer = await this._readStepFiles();
            // create steps in vm context
            vm.runInNewContext(stepFileBuffer.toString(), sandbox_1.default);
            const filePaths = await this._readGlob(this.GLOB_PATH);
            filePaths.forEach(async (filePath) => {
                await this._outputFile(filePath, steps);
            });
            if (this.WATCH_MODE) {
                this._watcher = new watcher_1.default([this.GLOB_PATH]);
                this._watcher.on('change', (filePath) => this._outputFile(filePath, steps));
                this._watcher.on('add', (filePath) => this._outputFile(filePath, steps));
                helpers_1.log('Gherkinizer is now watching files');
            }
        }
        catch (exception) {
            console.error(exception);
            process.exit(1);
        }
    }
    /**
     * Creates and outputs either spec or step files
     * @param filePath Filepath of the featureFile
     * @param steps Boolean to parse steps
     */
    async _outputFile(filePath, steps) {
        const { doc, pickles } = await this._parseFeatureFiles(filePath);
        if (!util.isNullOrUndefined(doc.feature)) {
            const file = this._createTemplateFile(doc.feature.name, pickles, steps);
            await this._writeFile(path.join(this.PATH_OUT_DIR, doc.feature.name), file);
        }
    }
    /**
     * Creates the template parser
     *
     * @param templateFilePath Template file path
     */
    async _createTemplate(templateFilePath) {
        const templateFileBuffer = await fs.readFile(templateFilePath);
        this._cucumber = new parser_1.default();
        this._template = new template_1.default(templateFileBuffer.toString());
    }
    async _readStepFiles() {
        return new Promise(async (res, rej) => {
            let stepFileBuffer = new Buffer('');
            const newLine = new Buffer('\n');
            const stepFilePaths = await this._readGlob(this.STEPS);
            stepFilePaths.forEach(async (filePath, index, array) => {
                const readFile = await fs.readFile(filePath);
                stepFileBuffer = Buffer.concat([stepFileBuffer, newLine, readFile]);
                if (index === array.length - 1) {
                    res(stepFileBuffer);
                }
            });
        });
    }
    async _readGlob(fileGlob) {
        return new Promise((res, rej) => {
            glob(fileGlob, { ignore: 'node_modules/**' }, (err, matches) => {
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
        const fileContent = await fs.readFile(featureFilePath);
        return this._cucumber.parse(fileContent.toString());
    }
    /**
     * Takes a feature name and `Pickle`s, to translate it to a model used for templating a **spec** file
     * @param feature Name of the feature
     * @param pickles Pickled Gherkin Document
     * @param stepFile If true, template model will match a step file
     */
    _createTemplateFile(feature, pickles, stepFile = false) {
        const templateModel = {
            /**
             * At this point we know that doc.feature is defined because we check with
             * `isNullOrUndefined` before calling this function
             */
            feature,
            scenarios: []
        };
        const createName = (name) => {
            if (stepFile) {
                return name.replace(/\$\d+/g, '(.+)');
            }
            return name;
        };
        templateModel.scenarios = pickles.reduce((model, pickle) => {
            const scenarioModel = {
                name: createName(pickle.name),
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
        const definitions = [...sandbox_1.default.get(pickle.type), ...sandbox_1.default.get('Step')];
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
     * @param templateOutput parsed template string
     */
    _writeFile(fileName, templateOutput) {
        fileName = fileName.replace(/\s/g, '_');
        return fs.outputFile(fileName + '.js', templateOutput);
    }
}
exports.default = Gherkinizer;
//# sourceMappingURL=main.js.map