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
const TEMPLATE_FILE = path.join(__dirname, '../templates/specfile.hbs');

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

    private async _parseFeatureFiles(featureFilePath: string): Promise<{ doc: GherkinDocument, pickles: Pickle[] }> {
        const fileContent = await readfileAsync(featureFilePath);
        return this._cucumber.parse(fileContent.toString());
    }

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
                func = func.replace('$' + (index + 1), match);
            });

        }

        return func;
    }

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
