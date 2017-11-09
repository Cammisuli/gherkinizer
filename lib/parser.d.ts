export default class CucumberParser {
    private _compiler;
    private _parser;
    constructor();
    /**
     * Parse takes a feature file (as a string), and parses it.
     * It then returns the `GherkinDocument` (AST) and `Pickle[]`
     * @param fileContent feature file content used to parse
     */
    parse(fileContent: string): {
        doc: GherkinDocument;
        pickles: Pickle[];
    };
    compile(doc: GherkinDocument): Pickle[];
    private _compileScenario(scenario);
    private _compileScenarioOutline(scenarioOutline);
    private _pickleStep(step);
    private _interpolate(name, variableCells, valueCells);
}
