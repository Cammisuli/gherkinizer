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
    constructor(GLOB_PATH, STEPS, PATH_OUT_DIR, WATCH_MODE = false, VERBOSE = false) {
        this.GLOB_PATH = GLOB_PATH;
        this.STEPS = STEPS;
        this.PATH_OUT_DIR = PATH_OUT_DIR;
        this.WATCH_MODE = WATCH_MODE;
        this.VERBOSE = VERBOSE;
        // nothing needed
    }
    /**
     * Creates step files by reading a common feature file. (Reusable scenarios)
     *
     * @param templateFilePath Path to template file used to create step files
     */
    async createSteps() {
        if (this.VERBOSE) {
            helpers_1.log('Creating step files');
        }
        await this._createTemplate(path.join(__dirname, '../templates/stepfile.hbs'));
        await this._start(true);
    }
    /**
     * Creates spec files by reading cucumber feature files.
     *
     * @param templateFilePath Path to the template file used to create spec files
     */
    async createSpecs() {
        if (this.VERBOSE) {
            helpers_1.log('Creating spec files');
        }
        await this._createTemplate(path.join(__dirname, '../templates/specfile.hbs'));
        await this._start(false);
    }
    async _start(steps, reWatchSteps = false) {
        try {
            const stepFileBuffer = await this._readStepFiles();
            // create steps in vm context
            sandbox_1.default.reset();
            vm.runInNewContext(stepFileBuffer.toString(), sandbox_1.default);
            const filePaths = await this._readGlob(this.GLOB_PATH + '/**/*.feature');
            filePaths.forEach(async (filePath) => {
                if (this.VERBOSE) {
                    helpers_1.log('Reading feature file: ' + filePath);
                }
                await this._outputFile(filePath, steps);
            });
            this._watchFiles(steps);
        }
        catch (exception) {
            console.error(exception);
            process.exit(1);
        }
    }
    _watchFiles(steps) {
        if (this.WATCH_MODE) {
            const featureWatcher = new watcher_1.default([this.GLOB_PATH + '/**/*.feature']);
            featureWatcher.on('change', (filePath) => this._outputFile(filePath, steps));
            featureWatcher.on('add', (filePath) => this._outputFile(filePath, steps));
            const stepWatcher = new watcher_1.default([this.STEPS + '/**/*.js']);
            stepWatcher.on('change', (filePath) => {
                helpers_1.log('Step file changed. Clearing cache');
                featureWatcher.close();
                stepWatcher.close();
                this._start(steps);
            });
            stepWatcher.on('add', (filePath) => {
                helpers_1.log('Step file added. Clearing cache');
                featureWatcher.close();
                stepWatcher.close();
                this._start(steps);
            });
            helpers_1.log(`Gherkinizer is now watching ${steps ? 'reusable scenario' : 'feature'} files`);
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
            const relativeFolder = this._generateRelativeFileFolder(filePath, this.GLOB_PATH);
            const filename = relativeFolder + path.parse(filePath).name;
            const file = this._createTemplateFile(doc.feature.name, filename, pickles, steps);
            let fileOutput = path.join(this.PATH_OUT_DIR, filename);
            if (!steps) {
                fileOutput = fileOutput + '.spec';
            }
            await this._writeFile(fileOutput, file);
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
            const stepFilePaths = await this._readGlob(this.STEPS + '/**/*.js');
            stepFilePaths.forEach(async (filePath, index, array) => {
                if (this.VERBOSE) {
                    helpers_1.log('Reading step file: ' + filePath);
                }
                const readFile = fs.readFileSync(filePath);
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
     * @param filename Feature file name (base name)
     * @param pickles Pickled Gherkin Document
     * @param stepFile If true, template model will match a step file
     */
    _createTemplateFile(feature, filename, pickles, stepFile = false) {
        const templateModel = {
            /**
             * At this point we know that doc.feature is defined because we check with
             * `isNullOrUndefined` before calling this function
             */
            feature,
            filename,
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
        // if (this.VERBOSE) {
        //     log('trying to match ' + pickle.text);
        // }
        const def = definitions.find((f) => f.regex.test(pickle.text));
        if (!def) {
            // if (this.VERBOSE) {
            //     log('No step found for ' + pickle.text);
            // }
            return null;
        }
        // if (this.VERBOSE) {
        //     log('Found match for ' + pickle.text);
        // }
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
    _generateRelativeFileFolder(filePath, basePath) {
        const relPath = path.relative(basePath, filePath);
        const relFolder = path.parse(relPath).dir;
        const result = relFolder.length === 0 ? '' : relFolder.replace(/\\/g, '/') + '/';
        console.log('filePath=' + filePath + ', basePath=' + basePath + ' --> result=' + result);
        return result;
    }
}
exports.default = Gherkinizer;
//# sourceMappingURL=main.js.map