"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("./main");
const path = require("path");
const GLOB_PATH = process.argv[2] || '**/*.feature';
const STEPS_FILE = process.argv[3] || 'sample/steps.js';
const OUTPUT_DIR = process.argv[4] || 'specs/';
const TEMPLATE_FILE = path.join(__dirname, '../templates/specfile.hbs');
(async () => {
    await new main_1.Main(GLOB_PATH, STEPS_FILE, OUTPUT_DIR, TEMPLATE_FILE).run();
})();
//# sourceMappingURL=index.js.map