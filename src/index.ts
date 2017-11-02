import { Main } from './main';

import * as path from 'path';

const GLOB_PATH = process.argv[2] || '**/*.feature';
const STEPS_FILE = process.argv[3] || 'sample/steps.js';
const OUTPUT_DIR = process.argv[4] || 'specs/';
const TEMPLATE_FILE = path.join(__dirname, '../templates/specfile.hbs');

(async () => {
    await new Main(GLOB_PATH, STEPS_FILE, OUTPUT_DIR, TEMPLATE_FILE).run();
})();
