Given(/^Given a variable set to '(.+)'$/, () => {
    var test = $1;
})

When(/^When I increment the variable by '(.+)'$/, () => {
    console.log($1);
})