import Gherkinizer from './main';

import * as path from 'path';
import * as yargs from 'yargs';

/**
 * Set up command line options
 */
const argv = yargs
    .usage('Usage: gherkinizer **/*.feature **/steps.js specs/')
    // .alias('w', 'watch')
    // .boolean(['steps', 'watch'])
    .options({
        steps: {
            default: false,
            type: 'boolean'
        },
        watch: {
            alias: 'w',
            default: false,
            type: 'boolean'
        },
        verbose: {
            alias: 'v',
            default: false,
            type: 'boolean'
        }
    })
    .help()
    .argv;

const GLOB_PATH = argv._[0] || '**/*.feature';
const STEPS = argv._[1] || 'sample/steps.js';
const OUTPUT_DIR = argv._[2] || 'specs/';

(async () => {
    const gherkinizer = new Gherkinizer(GLOB_PATH, STEPS, OUTPUT_DIR, argv.watch, argv.verbose);
    if (argv.steps) {
        await gherkinizer.createSteps();
    } else {
        await gherkinizer.createSpecs();
    }
})();
