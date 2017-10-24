import * as fs from 'fs';
import * as glob from 'glob';
import * as path from 'path';
import * as util from 'util';
import * as vm from 'vm';

import CucumberParser from './parser';
import StepsSandbox from './sandbox';
import Template, { ScenarioModel, TemplateModel } from './template';

const GLOB_PATH = process.argv[2] || '**/*.feature';
const STEPS_FILE = process.argv[3] || 'sample/steps.js';
const FEATURE_FILES_PATH = process.argv[4] || 'specs/';
const TEMPLATE_FILE = path.join(__dirname, '../templates/specfile.mustache');

const readfileAsync = util.promisify(fs.readFile);
const writeFileAsync = util.promisify(fs.writeFile);
class Main {
    private _template: Template;
    private _cucumber: CucumberParser;

    constructor() {
        // nothing needed
    }

    public async run() {
        let stepsFile;
        let templateFile;
        try {
            stepsFile = await readfileAsync(STEPS_FILE);
            templateFile = await readfileAsync(TEMPLATE_FILE);
            this._cucumber = new CucumberParser();
            this._template = new Template(templateFile.toString());

            // create steps in vm context
            vm.runInNewContext(stepsFile.toString(), StepsSandbox);
        } catch (exception) {
            console.error(exception);
            process.exit(1);
        }

        const filePaths = await this._readGlob();
        filePaths.forEach(async (filePath) => {
            try {
                const { doc, pickles } = await this._parseFeatureFiles(filePath);
                const specFile = this._createSpecFile(doc, pickles);
                await this._writeSpecFile(doc.feature.name, specFile);
            } catch (exception) {
                console.error(exception);
                process.exit(1);
            }
        });

    }

    private async _readGlob(): Promise<string[]> {
        return new Promise<string[]>((res, rej) => {
            glob(GLOB_PATH, { ignore: 'node_modules/**' }, (err, matches) => {
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
        const fileContent = await readfileAsync(featureFilePath);
        return this._cucumber.parse(fileContent.toString());
    }

    /**
     * Takes a `GherkinDocument` and `Pickle`s, to translate it to a model used for templating
     * @param doc Parsed feature file
     * @param pickles Pickled Gherkin Document
     */
    private _createSpecFile(doc: GherkinDocument, pickles: Pickle[]): string {
        const templateModel: TemplateModel = {
            feature: doc.feature.name,
            scenarios: []
        };

        templateModel.scenarios = pickles.reduce<ScenarioModel[]>((model, pickle) => {
            const scenarioModel: ScenarioModel = {
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
        const definitions = StepsSandbox.get(pickle.type);
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
    private _writeSpecFile(fileName: string, specFile: string): Promise<void> {
        fileName = fileName.replace(/\s/g, '_');
        const specPath = FEATURE_FILES_PATH;
        try {
            fs.statSync(specPath);
        } catch {
            fs.mkdirSync(specPath);
        }
        return writeFileAsync(path.join(specPath, fileName + '.js'), specFile);
    }
}

new Main().run();
