import * as fs from 'fs-extra';
import * as glob from 'glob';
import * as path from 'path';
import * as util from 'util';
import * as vm from 'vm';

import { log } from './helpers';
import CucumberParser from './parser';
import StepsSandbox from './sandbox';
import Template, { ScenarioModel, TemplateModel } from './template';
import Watcher from './watcher';

export default class Gherkinizer {
    private _template: Template;
    private _cucumber: CucumberParser;

    /**
     * Takes feature files, matches steps to a step definition file and outputs parsed templates
     *
     * @param GLOB_PATH Glob path used to retrieve all feature files to parse
     * @param STEPS Steps file used to match gherkin keywords to steps. 
     * If creating step files, then this is the output directory
     * @param PATH_OUT_DIR Out directory where parsed spec files are put
     * @param TEMPLATE_FILE Template file used to output files
     */
    constructor(
        private GLOB_PATH: string,
        private STEPS: string,
        private PATH_OUT_DIR: string,
        private WATCH_MODE: boolean = false,
        private VERBOSE: boolean = false
    ) {
        // nothing needed
    }

    /**
     * Creates step files by reading a common feature file. (Reusable scenarios)
     * 
     * @param templateFilePath Path to template file used to create step files
     */
    public async createSteps() {
        if (this.VERBOSE) {
            log('Creating step files');
        }
        await this._createTemplate(path.join(__dirname, '../templates/stepfile.hbs'));

        await this._start(true);
        this._watchFiles(true);
    }

    /**
     * Creates spec files by reading cucumber feature files.
     * 
     * @param templateFilePath Path to the template file used to create spec files
     */
    public async createSpecs() {
        if (this.VERBOSE) {
            log('Creating spec files');
        }
        await this._createTemplate(path.join(__dirname, '../templates/specfile.hbs'));

        await this._start();
        this._watchFiles(false);
    }

    private async _start(steps: boolean = false) {
        try {
            const stepFileBuffer = await this._readStepFiles();
            // create steps in vm context
            StepsSandbox.reset();
            vm.runInNewContext(stepFileBuffer.toString(), StepsSandbox);

            const filePaths = await this._readGlob(this.GLOB_PATH);

            filePaths.forEach(async (filePath) => {
                if (this.VERBOSE) {
                    log('Reading feature file: ' + filePath);
                }
                await this._outputFile(filePath, steps);
            });
        } catch (exception) {
            console.error(exception);
            process.exit(1);
        }
    }

    private _watchFiles(steps: boolean = false) {
        if (this.WATCH_MODE) {
            const featureWatcher = new Watcher([this.GLOB_PATH]);
            featureWatcher.on('change', (filePath) => this._outputFile(filePath, steps));
            featureWatcher.on('add', (filePath) => this._outputFile(filePath, steps));

            const stepWatcher = new Watcher([this.STEPS]);
            stepWatcher.on('change', (filePath) => {
                log('Step file changed. Clearing cache');
                this._start(steps);
            });
            stepWatcher.on('add', (filePath) => {
                log('Step file added. Clearing cache');
                this._start(steps);
            });

            log(`Gherkinizer is now watching ${steps ? 'reusable scenario' : 'feature' } files`);
        }
    }

    /**
     * Creates and outputs either spec or step files
     * @param filePath Filepath of the featureFile
     * @param steps Boolean to parse steps
     */
    private async _outputFile(filePath: string, steps: boolean) {
        const { doc, pickles } = await this._parseFeatureFiles(filePath);
        if (!util.isNullOrUndefined(doc.feature)) {
            const filename = path.parse(filePath).name;
            const file = this._createTemplateFile(doc.feature.name, filename, pickles, steps);
            await this._writeFile(path.join(this.PATH_OUT_DIR, filename), file);
        }
    }

    /**
     * Creates the template parser
     * 
     * @param templateFilePath Template file path
     */
    private async _createTemplate(templateFilePath: string): Promise<void> {
        const templateFileBuffer = await fs.readFile(templateFilePath);
        this._cucumber = new CucumberParser();
        this._template = new Template(templateFileBuffer.toString());
    }

    private async _readStepFiles(): Promise<Buffer> {
        return new Promise<Buffer>(async (res, rej) => {
            let stepFileBuffer: Buffer = new Buffer('');

            const newLine = new Buffer('\n');

            const stepFilePaths = await this._readGlob(this.STEPS);
            stepFilePaths.forEach(async (filePath, index, array) => {
                if (this.VERBOSE) {
                    log('Reading step file: ' + filePath);
                }
                const readFile = fs.readFileSync(filePath);
                stepFileBuffer = Buffer.concat([stepFileBuffer, newLine, readFile]);
                if (index === array.length - 1) {
                    res(stepFileBuffer);
                }
            });
        });
    }

    private async _readGlob(fileGlob: string): Promise<string[]> {
        return new Promise<string[]>((res, rej) => {
            glob(fileGlob, { ignore: 'node_modules/**' }, (err, matches) => {
                if (matches.length > 0) {
                    res(matches);
                } else {
                    rej('No files found');
                }
            });
        });
    }

    /**
     * Parses feature files using Gherkin
     * @param featureFilePath Feature file
     */
    private async _parseFeatureFiles(featureFilePath: string): Promise<{ doc: GherkinDocument, pickles: Pickle[] }> {
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
    private _createTemplateFile(feature: string,
                                filename: string, pickles: Pickle[],
                                stepFile: boolean = false): string {
        const templateModel: TemplateModel = {
            /**
             * At this point we know that doc.feature is defined because we check with 
             * `isNullOrUndefined` before calling this function
             */
            feature,
            filename,
            scenarios: []
        };

        const createName = (name: string) => {
            if (stepFile) {
                return name.replace(/\$\d+/g, '(.+)');
            }
            return name;
        };

        templateModel.scenarios = pickles.reduce<ScenarioModel[]>((model, pickle) => {
            const scenarioModel: ScenarioModel = {
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
    private _mapStepFunc(pickle: PickleStep): string | null {
        const definitions = [...StepsSandbox.get(pickle.type), ...StepsSandbox.get('Step')];
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
    private _writeFile(fileName: string, templateOutput: string): Promise<void> {
        fileName = fileName.replace(/\s/g, '_');
        if (!this.STEPS) {
            fileName = fileName + '.spec';
        }
        return fs.outputFile(fileName + '.js', templateOutput);
    }
}
