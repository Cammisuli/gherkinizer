declare module "gherkin" {

    class Parser {
        parse(tokenScanner: string, tokenMatcher?: any): GherkinDocument
    }

    class Compiler {
        compile(gherkin_document: GherkinDocument): Pickle[]
    }

    export {
        Parser,
        Compiler
    };
}

interface GherkinDocument {
    comments: string[];
    feature: GherkinFeature;
    type: 'GherkinDocument'
}

interface GherkinFeature extends GherkinBase<'Feature'> {
    children: Array<GherkinScenario | GherkinScenarioOutline | GherkinBackground>
    tags: string[];
}

interface GherkinScenario extends GherkinBase<'Scenario'> {
    steps: GherkinStep[];
    tags: string[];

}

interface GherkinBackground extends GherkinBase<'Background'> {
    steps: GherkinStep[];
    tags: string[];
}

interface GherkinScenarioOutline extends GherkinBase<'ScenarioOutline'> {
    steps: GherkinStep[];
    tags: string[];
    examples: GherkinExample[];
}

interface GherkinStep extends GherkinBase<'Step'> {
    text: string;

}

interface GherkinExample extends GherkinBase<'Examples'> {
    tableBody: GherkinTableRow[];
    tableHeader: GherkinTableRow;
}

interface GherkinTableRow {
    location: GherkinLocation;
    type: 'TableRow';
    cells: GherkinTableCell[];
}
interface GherkinTableCell {
    location: GherkinLocation;
    type: 'TableCell';
    value: string;
}

interface GherkinBase<T> {
    description?: string;
    /**
     * Contains `Given `, `Then `, `When ` and `And `.
     */
    keyword: StepKeyword;
    location: GherkinLocation;
    name: string;
    type: T;
}

interface GherkinLocation {
    line: number
    column: number
}


/**
 * IM PICKLE RIIIIIIICK
 */
interface Pickle {
    name: string;
    steps: PickleStep[];
}

interface PickleStep {
    arguments?: string[];
    text: string;
    type: StepKeyword;
}

type StepKeyword = 'Given' | 'When' | 'Then' | 'And';