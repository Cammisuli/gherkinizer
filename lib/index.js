"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("./main");
const path = require("path");
const yargs = require("yargs");
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
/**
 * OUTPUT_DIR is only used for spec file creation. It is not needed for step creation
 */
const OUTPUT_DIR = argv._[2] || 'specs/';
(async () => {
    const gherkinizer = new main_1.default(GLOB_PATH, STEPS, OUTPUT_DIR);
    if (argv.steps) {
        await gherkinizer.createSteps(path.join(__dirname, '../templates/stepfile.hbs'));
    }
    else {
        await gherkinizer.createSpecs(path.join(__dirname, '../templates/specfile.hbs'));
    }
})();
//# sourceMappingURL=index.js.map