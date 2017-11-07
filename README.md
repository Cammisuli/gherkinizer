# gherkinizer
Takes cucumber feature files and creates generated spec.js files for use in Cypress.

It also allows for the creation of step files with a concept of reusable scenarios. This allow us to create steps that have steps within them.

## Usage
For spec creation, takes three arguments (in order)
* Source files glob. Files that should be 'gherkinized'
* File where steps are location
* Out directory

`gherkinizer **/*.feature steps.js outdir`

For step creation, takes four arguments (in order)
* --steps
* Source files glob. Files that should be 'gherkinized'
* File where steps are location
* Out directory

`gherkinizer --steps **/*.feature steps.js outdir`

### Watch mode
Using watch mode, gherkinizer will watch all feature files and output any changes to those files.
`gherkinizer -w **/*.feature steps.js outdir`
`gherkinizer -w --steps **/*.feature steps.js outdir`

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
      And I do something else
  
    Scenario Outline: much more complex stufff
      Given a variable set to '<var>'
      When I increment the variable by '<increment>'
      Then the variable should contain <result>
      But I do something else
  
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
* But
* Step **This keyword is a catch all, so it can be used for all above steps**

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

Step(/^I do something else$/, () => {
    document.querySelectorAll('input').click();
})
```

### Output file
The output file then has functions that matches a mocha (cypress) style suite.
```js
describe(`Simple maths`, () => {
    it(`easy maths`, () => {
        // Given a variable set to '1'`
        var test = 1;
        
        // When I increment the variable by '1'
        console.log(1);
        // Then the variable should contain 2
         assert(test).equal(2);
        // And I do something else
        document.querySelectorAll('input').click();
    });
    // Shortened for brevity 
});
```