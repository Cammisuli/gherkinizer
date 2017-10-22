import * as fs from 'fs';
import * as glob from 'glob';
import * as util from 'util';

import CucumberParser from './parser';
import StepsSandbox from './sandbox';
import Template from './template';

const GLOB_PATH = process.argv[2] || '**/*.feature';
const STEPS_FILE = process.argv[3] || 'sample/steps.js';

const readfileAsync = util.promisify(fs.readFile);

/**
 * Main function to handle parsing and file creation
 */
async function main() {
    const cucumber = new CucumberParser();
    const stepsFile = await readfileAsync(STEPS_FILE);

    glob(GLOB_PATH, (err, matches) => {
        if (matches.length > 0) {
            matches.forEach(async (file) => {
                const fileContent = await readfileAsync(file);
                const { pickles } = cucumber.parse(fileContent.toString());
            });
        } else {
            throw Error('No Files Found.');
        }
    });
}

main();
