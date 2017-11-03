import Main from './main';

import * as path from 'path';
import * as yargs from 'yargs';

/**
 * Set up command line options
 */
const argv = yargs
    .usage('Usage: gherkinizer **/*.feature **/steps.js specs/')
    .boolean('steps')
    .help()
    .argv;

const GLOB_PATH = argv._[0] || '**/*.feature';
const STEPS = argv._[1] || 'sample/steps.js';
const OUTPUT_DIR = argv._[2] || 'specs/';

(async () => {
    const gherkinizer = new Main(GLOB_PATH, STEPS, OUTPUT_DIR);
    if (argv.steps) {
        await gherkinizer.createSteps(path.join(__dirname, '../templates/stepfile.hbs'));
    } else {
        await gherkinizer.createSpecs(path.join(__dirname, '../templates/specfile.hbs'));
    }
})();
