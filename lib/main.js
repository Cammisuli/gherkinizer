"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
const glob = require("glob");
const path = require("path");
const util = require("util");
const vm = require("vm");
const md5_1 = require("ts-md5/dist/md5");
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
        this._fileHashes = new Map();
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
        await this._outputAllFiles(true);
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
        await this._outputAllFiles(false);
    }
    async _outputAllFiles(steps, reWatchSteps = false) {
        try {
            // keep rebuilding until no step files change -- this is a brute force
            // approach to satisfying a dependency tree
            while (await this._stepFileChanged()) {
                helpers_1.log('Building feature files...');
                // load step files into sandbox
                const stepFileBuffer = await this._readStepFiles();
                sandbox_1.default.reset();
                vm.runInNewContext(stepFileBuffer.toString(), sandbox_1.default);
                const filePaths = await this._readGlob(this.GLOB_PATH + Gherkinizer._featureFilePat);
                for (const filePath of filePaths) {
                    if (this.VERBOSE) {
                        helpers_1.log('Reading feature file: ' + filePath);
                    }
                    await this._outputFile(filePath, steps);
                }
            }
            if (this.WATCH_MODE) {
                this._watchFiles(steps);
            }
        }
        catch (exception) {
            console.error(exception);
            process.exit(1);
        }
    }
    _watchFiles(steps) {
        const featureWatcher = new watcher_1.default([this.GLOB_PATH + Gherkinizer._featureFilePat]);
        featureWatcher.on('change', async (filePath) => {
            await this._outputFile(filePath, steps);
        });
        featureWatcher.on('add', async (filePath) => {
            await this._outputFile(filePath, steps);
        });
        helpers_1.log('Watching files: ' + this.GLOB_PATH + Gherkinizer._featureFilePat);
        const stepWatcher = new watcher_1.default([this.STEPS]);
        stepWatcher.on('change', async (filePath) => {
            featureWatcher.close();
            stepWatcher.close();
            await this._outputAllFiles(steps);
        });
        stepWatcher.on('add', async (filePath) => {
            featureWatcher.close();
            stepWatcher.close();
            await this._outputAllFiles(steps);
        });
        helpers_1.log('Watching files: ' + this.STEPS);
    }
    async _updateFileHash(filePath, content = '') {
        if (content.length === 0) {
            content = fs.readFileSync(filePath).toString();
        }
        const hash = md5_1.Md5.hashAsciiStr(content).toString();
        const oldHash = this._fileHashes.get(filePath);
        this._fileHashes.set(filePath, hash);
        if (oldHash === undefined) {
            helpers_1.log('File hash added for: ' + filePath);
            return true;
        }
        else if (oldHash !== hash) {
            helpers_1.log('File hash changed for: ' + filePath);
            return true;
        }
        return false;
    }
    async _stepFileChanged() {
        let result = false;
        const filePaths = await this._readGlob(this.STEPS);
        for (const filePath of filePaths) {
            const fileChanged = await this._updateFileHash(filePath);
            result = result || fileChanged;
        }
        return result;
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
            const content = this._createTemplateFile(doc.feature.name, filename, pickles, steps);
            const outputPath = path.join(this.PATH_OUT_DIR, filename + (!steps ? '.spec' : '') + '.js')
                .replace(/\s/g, '_');
            fs.outputFile(outputPath, content);
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
        let buffer = new Buffer('');
        const newLine = new Buffer('\n');
        const filePaths = await this._readGlob(this.STEPS);
        for (const filePath of filePaths) {
            if (this.VERBOSE) {
                helpers_1.log('Reading step file: ' + filePath);
            }
            const content = await fs.readFile(filePath);
            buffer = Buffer.concat([buffer, newLine, content]);
        }
        return buffer;
    }
    async _readGlob(fileGlob) {
        return glob.sync(fileGlob, { ignore: 'node_modules/**' });
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
                return name.replace(/\$\d+/g, '([^\']+)'); // prevent long matching
            }
            return name;
        };
        templateModel.scenarios = pickles.reduce((model, pickle) => {
            const pickleName = createName(pickle.name);
            const pickleSteps = pickle.steps.map((p) => ({
                func: this._mapStepFunc(p),
                text: `${p.type} ${p.text}`
            }));
            // add reusable scenario that we processed to the steps sandbox 
            if (stepFile) {
                const funcString = '() => {' + pickleSteps.reduce((result, pickleStep) => result + pickleStep.func, '') + '}';
                sandbox_1.default.defineStepWithFuncString(new RegExp(pickleName), funcString);
            }
            const scenarioModel = {
                name: pickleName,
                steps: pickleSteps,
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
            console.warn('No step found for: ' + pickle.text);
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
                // add a variable marker to handle variable swapping
                const variableMarker = match.replace(/^\$(\d+)$/, '$_var_$1');
                func = func.replace(new RegExp('\\$' + (index + 1), 'g'), variableMarker);
            });
        }
        // remove variable markers
        func = func.replace(/\$_var_(\d+)/g, (match, arg) => '$' + arg);
        return func;
    }
    _generateRelativeFileFolder(filePath, basePath) {
        const relPath = path.relative(basePath, filePath);
        const relFolder = path.parse(relPath).dir;
        return relFolder.length === 0 ? '' : relFolder.replace(/\\/g, '/') + '/';
    }
}
Gherkinizer._featureFilePat = '/**/*.feature';
exports.default = Gherkinizer;
//# sourceMappingURL=main.js.map