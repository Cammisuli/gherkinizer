"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gherkin_1 = require("gherkin");
class CucumberParser {
    constructor() {
        this._compiler = new gherkin_1.Compiler();
        this._parser = new gherkin_1.Parser();
    }
    parse(fileContent) {
        return this._parser.parse(fileContent);
    }
    compile(doc) {
        return this._compiler.compile(doc);
    }
}
exports.CucumberParser = CucumberParser;
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
//# sourceMappingURL=parser.js.map