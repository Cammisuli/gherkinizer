import chalk from 'chalk';
import * as fs from 'fs';
import * as glob from 'glob';
import { promisify } from 'util';

import { CucumberParser } from './parser';

const GLOB_PATH = process.argv[2] || '**/*.feature';

const readfileAsync = promisify(fs.readFile);

async function main() {
    const cucumber = new CucumberParser();

    glob(GLOB_PATH, (err, matches) => {
        if (matches.length > 0) {
            matches.forEach(async (file) => {
                const fileContent = await readfileAsync(file);
                const doc = cucumber.parse(fileContent.toString());
                const pickles = cucumber.compile(doc);
            });
        } else {
            console.log(chalk.red('No files found'));
        }
    });
}

main();
