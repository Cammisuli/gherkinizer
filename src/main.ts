import * as fs from 'fs-extra';
import * as glob from 'glob';
import * as path from 'path';
import * as util from 'util';
import * as vm from 'vm';

import CucumberParser from './parser';
import StepsSandbox from './sandbox';
import Template, { ScenarioModel, TemplateModel } from './template';

export default class Main {
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
        private PATH_OUT_DIR: string
    ) {
        // nothing needed
    }

    /**
     * Creates step files by reading a common feature file. (Reusable scenarios)
     * 
     * @param templateFilePath Path to template file used to create step files
     */
    public async createSteps(templateFilePath: string) {
       await this._start(templateFilePath, true);
    }

    /**
     * Creates spec files by reading cucumber feature files.
     * 
     * @param templateFilePath Path to the template file used to create spec files
     */
    public async createSpecs(templateFilePath: string) {
        await this._start(templateFilePath);
    }

    private async _start(templateFilePath: string, steps: boolean = false) {
        try {
            await this._createTemplate(templateFilePath);
            const stepFileBuffer = await this._readStepFiles();

            // create steps in vm context
            vm.runInNewContext(stepFileBuffer.toString(), StepsSandbox);

            const filePaths = await this._readGlob(this.GLOB_PATH);
            filePaths.forEach(async (filePath) => {
                const { doc, pickles } = await this._parseFeatureFiles(filePath);
                if (!util.isNullOrUndefined(doc.feature)) {
                    const file = this._createTemplateFile(doc.feature.name, pickles, steps);
                    await this._writeFile(path.join(this.PATH_OUT_DIR, doc.feature.name), file);
                }
            });

        } catch (exception) {
            console.error(exception);
            process.exit(1);
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
                const readFile = await fs.readFile(filePath);
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
     * @param pickles Pickled Gherkin Document
     * @param stepFile If true, template model will match a step file
     */
    private _createTemplateFile(feature: string, pickles: Pickle[], stepFile: boolean = false): string {
        const templateModel: TemplateModel = {
            /**
             * At this point we know that doc.feature is defined because we check with 
             * `isNullOrUndefined` before calling this function
             */
            feature,
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
    private _writeFile(fileName: string, templateOutput: string): Promise<void> {
        fileName = fileName.replace(/\s/g, '_');
        return fs.outputFile(fileName + '.js', templateOutput);
    }
}
