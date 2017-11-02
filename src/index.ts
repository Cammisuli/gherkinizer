import { Main } from './main';

import * as path from 'path';
import * as yargs from 'yargs';

/**
 * Set up command line options
 */
const argv = yargs
    .usage('Usage: gherkinizer **/*.feature steps.js specs/')
    .command('<step> [glob] [stepsFile] [outdir]', 'Parse feature files to the output directory', (args: any) => {
        return args.positional('step', {
            description: 'When present, gherkinizer will output step files',
            type: 'boolean',
            default: false
        });
    })
    .demand(3)
    .help()
    .argv;

const GLOB_PATH = argv._[0] || '**/*.feature';
const STEPS_FILE = argv._[1] || 'sample/steps.js';
const OUTPUT_DIR = argv._[2] || 'specs/';
let TEMPLATE_FILE = '';
if (argv.step) {
    TEMPLATE_FILE = path.join(__dirname, '../templates/stepfile.hbs');
} else {
    TEMPLATE_FILE = path.join(__dirname, '../templates/specfile.hbs');
}

(async () => {
    await new Main(GLOB_PATH, STEPS_FILE, OUTPUT_DIR, TEMPLATE_FILE, argv.step).run();
})();
