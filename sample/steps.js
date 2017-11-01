Given(/^a variable set to '(.+)'$/, `var test = $1;`)

When(/^I increment the variable by '(.+)'$/, () => {
    console.log($1);
})

Then(/^the variable should contain (.+)/, () => {
    assert($1).equal($1);
})