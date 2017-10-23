"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gherkin_1 = require("gherkin");
class CucumberParser {
    constructor() {
        this._compiler = new gherkin_1.Compiler();
        this._parser = new gherkin_1.Parser();
    }
    /**
     * Parse takes a feature file (as a string), and parses it.
     * It then returns the `GherkinDocument` (AST) and `Pickle[]`
     * @param fileContent feature file content used to parse
     */
    parse(fileContent) {
        const doc = this._parser.parse(fileContent);
        const pickles = this.compile(doc);
        return {
            doc,
            pickles
        };
    }
    compile(doc) {
        const pickles = [];
        doc.feature.children.forEach((scenario) => {
            if (scenario.type === 'Background') {
                // TODO: do background?
            }
            else if (scenario.type === 'Scenario') {
                pickles.push(this._compileScenario(scenario));
            }
            else {
                pickles.push(...this._compileScenarioOutline(scenario));
            }
        });
        // return new reference of pickles
        return pickles;
    }
    _compileScenario(scenario) {
        const steps = scenario.steps.map((step) => {
            return this._pickleStep(step);
        });
        return {
            name: scenario.name,
            steps
        };
    }
    _compileScenarioOutline(scenarioOutline) {
        return scenarioOutline.examples
            .filter((ex) => ex.tableHeader !== undefined)
            .reduce((pickles, ex) => {
            const variableCells = ex.tableHeader.cells;
            const pickle = ex.tableBody.map((value) => {
                const valueCells = value.cells;
                // const steps = scenarioOutline.steps.length == 0 ? [] : [...backgroundSteps]
                // const tags //TODO tags
                const steps = scenarioOutline.steps.map((scenarioStep) => {
                    const stepText = this._interpolate(scenarioStep.text, variableCells, valueCells);
                    return {
                        text: stepText,
                        type: scenarioStep.keyword.trim()
                    };
                });
                return {
                    name: this._interpolate(scenarioOutline.name, variableCells, valueCells),
                    steps
                };
            });
            return [...pickles, ...pickle];
        }, []);
    }
    _pickleStep(step) {
        return {
            text: step.text,
            type: step.keyword.trim()
        };
    }
    _interpolate(name, variableCells, valueCells) {
        variableCells.forEach((variableCell, index) => {
            const valueCell = valueCells[index];
            const search = new RegExp('<' + variableCell.value + '>', 'g');
            name = name.replace(search, valueCell.value);
        });
        return name;
    }
}
exports.default = CucumberParser;
//# sourceMappingURL=parser.js.map