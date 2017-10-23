# Transpile
Takes cucumber feature files and creates generated spec.js files for use in Cypress

## Usage
Takes three arguements (in order)
* Source files glob. Files that should be 'gherkinized'
* File where steps are location
* Out directory

`gherkinizer **/*.feature steps.js outdir`

### Feature File
Basic structure of a cucumber .feature file
```
Feature: Simple maths
    In order to do maths
    As a developer
    I want to increment variables
  
    Scenario: easy maths
      Given a variable set to '1'
      When I increment the variable by '1'
      Then the variable should contain 2
  
    Scenario Outline: much more complex stufff
      Given a variable set to '<var>'
      When I increment the variable by '<increment>'
      Then the variable should contain <result>
  
      Examples:
        | var | increment | result |
        | 100 |         5 |    105 |
        |  99 |      1234 |   1333 |
        |  12 |         5 |     18 |
```

### Steps file
Steps files should contain functions that match the cucumber keywords. Keywords are:
* Given
* When
* Then
* And

Function structure then follows this interface: 
```
Keyword(regex, function)
```

```js
Given(/^a variable set to '(.+)'$/, () => {
    var test = $1;
})

When(/^I increment the variable by '(.+)'$/, () => {
    test = test + $1;
})

Then(/^the variable should contain '(.+)'/, () => {
    assert(test).equal($1);
})
```

### Output file
The output file then has functions that matches a mocha (cypress) style suite.
```js
describe(`Simple maths`, () => {
    describe(`easy maths`, () => {
        it(`Given a variable set to '1'`, () => {
            var test = 1;
        }
        );
        it(`When I increment the variable by '1'`, () => {
            console.log(1);
        }
        );
        it(`Then the variable should contain 2`, () => {
            assert(test).equal(2);
        }
        );
    });
    // Shortened for brevity 
});
```