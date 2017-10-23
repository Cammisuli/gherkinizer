import * as fs from 'fs';
import * as glob from 'glob';
import * as path from 'path';
import * as util from 'util';

import CucumberParser from './parser';
import Template from './template';

const GLOB_PATH = process.argv[2] || '**/*.feature';
const STEPS_FILE = process.argv[3] || 'sample/steps.js';
const TEMPLATE_FILE = path.join(__dirname, '../templates/specfile.hbs');

const readfileAsync = util.promisify(fs.readFile);

class Main {
    private _template: Template;
    private _cucumber: CucumberParser;

    constructor() {
        // nothing needed
    }

    public async run() {
        const stepsFile = await readfileAsync(STEPS_FILE);
        const templateFile = await readfileAsync(TEMPLATE_FILE);
        this._cucumber = new CucumberParser();
        this._template = new Template(templateFile.toString());

        const filePaths = await this._readGlob();
        filePaths.forEach(async (filePath) => {
            const { doc, pickles } = await this._parseFeatureFiles(filePath);
            const specFile = this._createSpecFile(doc, pickles);
            console.log(specFile);
        });

    }

    private async _readGlob(): Promise<string[]> {
        return new Promise<string[]>((res, rej) => {
            glob(GLOB_PATH, (err, matches) => {
                if (matches.length > 0) {
                    res(matches);
                } else {
                    rej('No files found');
                }
            });
        });
    }

    private async _parseFeatureFiles(featureFilePath: string): Promise<{doc: GherkinDocument, pickles: Pickle[]}> {
        const fileContent = await readfileAsync(featureFilePath);
        return this._cucumber.parse(fileContent.toString());
    }

    private _createSpecFile(doc: GherkinDocument, pickles: Pickle[]): string {
        return this._template.create({ feature: doc.feature.name, scenarios: pickles });
    }
}

new Main().run();
