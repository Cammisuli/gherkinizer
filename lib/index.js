"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("./main");
const path = require("path");
const yargs = require("yargs");
/**
 * Set up command line options
 */
const argv = yargs
    .usage('Usage: gherkinizer **/*.feature steps.js specs/')
    .command('<step> [glob] [stepsFile] [outdir]', 'Parse feature files to the output directory', (args) => {
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
}
else {
    TEMPLATE_FILE = path.join(__dirname, '../templates/specfile.hbs');
}
(async () => {
    await new main_1.Main(GLOB_PATH, STEPS_FILE, OUTPUT_DIR, TEMPLATE_FILE, argv.step).run();
})();
//# sourceMappingURL=index.js.map