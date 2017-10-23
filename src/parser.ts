import { Compiler, Parser } from 'gherkin';

export default class CucumberParser {
    private _compiler: Compiler;
    private _parser: Parser;

    constructor() {
        this._compiler = new Compiler();
        this._parser = new Parser();
    }

    /**
     * Parse takes a feature file (as a string), and parses it.
     * It then returns the `GherkinDocument` (AST) and `Pickle[]`
     * @param fileContent feature file content used to parse
     */
    public parse(fileContent: string): { doc: GherkinDocument, pickles: Pickle[] } {
        const doc = this._parser.parse(fileContent);
        const pickles = this.compile(doc);
        return {
            doc,
            pickles
        };
    }

    public compile(doc: GherkinDocument): Pickle[] {
        const pickles: Pickle[] = [];
        doc.feature.children.forEach((scenario) => {
            if (scenario.type === 'Background') {
                // TODO: do background?
            } else if (scenario.type === 'Scenario') {
                pickles.push(this._compileScenario(scenario));
            } else {
                pickles.push(...this._compileScenarioOutline(scenario));
            }
        });

        // return new reference of pickles
        return pickles;
    }

    private _compileScenario(scenario: GherkinScenario): Pickle {
        const steps: PickleStep[] = scenario.steps.map((step) => {
            return this._pickleStep(step);
        });

        return {
            name: scenario.name,
            steps
        };
    }

    private _compileScenarioOutline(scenarioOutline: GherkinScenarioOutline): Pickle[] {
        return scenarioOutline.examples
            .filter((ex) => ex.tableHeader !== undefined)
            .reduce<Pickle[]>((pickles, ex) => {
                const variableCells = ex.tableHeader.cells;
                const pickle = ex.tableBody.map<Pickle>((value) => {
                    const valueCells = value.cells;
                    // const steps = scenarioOutline.steps.length == 0 ? [] : [...backgroundSteps]
                    // const tags //TODO tags
                    const steps = scenarioOutline.steps.map<PickleStep>((scenarioStep) => {
                        const stepText = this._interpolate(scenarioStep.text, variableCells, valueCells);
                        return {
                            text: scenarioStep.keyword + stepText,
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

    private _pickleStep(step: GherkinStep): PickleStep {
        return {
            text: step.keyword + step.text,
            type: step.keyword.trim()
        };
    }

    private _interpolate(name: string, variableCells: GherkinTableCell[], valueCells: GherkinTableCell[]) {
        variableCells.forEach((variableCell, index) => {
            const valueCell = valueCells[index];
            const search = new RegExp('<' + variableCell.value + '>', 'g');
            name = name.replace(search, valueCell.value);
        });
        return name;
    }
}
