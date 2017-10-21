import { Compiler, GherkinDocument, Parser, Pickle } from 'gherkin';

export class CucumberParser {
    private _compiler: Compiler;
    private _parser: Parser;
    private _doc: GherkinDocument;
    private _pickles: Pickle[];

    constructor() {
        this._compiler = new Compiler();
        this._parser = new Parser();
    }

    public parse(fileContent: string) {
        return this._parser.parse(fileContent);
    }

    public compile(doc: GherkinDocument) {
        return this._compiler.compile(doc);
    }

}

// function doSomething() {
//     const compiler = new Compiler();
//     const parser = new Parser();

//     const doc = parser.parse(`Feature: Simple maths
//     In order to do maths
//     As a developer
//     I want to increment variables
  
//     Scenario: easy maths
//       Given a variable set to 1
//       When I increment the variable by 1
//       Then the variable should contain 2
  
//     Scenario Outline: much more complex stuff
//       Given a variable set to <var>
//       When I increment the variable by <increment>
//       Then the variable should contain <result>
  
//       Examples:
//         | var | increment | result |
//         | 100 |         5 |    105 |
//         |  99 |      1234 |   1333 |
//         |  12 |         5 |     18 |`);
//     const pickles = new Compiler().compile(doc);
//     console.log(pickles)
// }

// doSomething();

