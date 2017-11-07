defineStep(/^I open the MobiControl login page$/, () => {
    cy.visit('https://localhost/MobiControl/WebConsole/login');

})
defineStep(/^I open the MobiControl devices page$/, () => {
    cy.visit('https://localhost/MobiControl/WebConsole/devices');

})
defineStep(/^I enter username '(.+)'$/, () => {
    var e = cy.get('$3');
    e.type('$1');
    if ('[placeholder="Username"]' != 'undefined') {
        e.type('[placeholder="Username"]');
    }

})
defineStep(/^I enter password '(.+)'$/, () => {
    var e = cy.get('$3');
    e.type('$1');
    if ('[placeholder="Password"]' != 'undefined') {
        e.type('[placeholder="Password"]');
    }

})
defineStep(/^I click on the LOG_IN button$/, () => {
    cy.get('.primary').click();

})
defineStep(/^I click on the search entry box$/, () => {
    cy.get('.TailCursorContent').click();

})
defineStep(/^I enter search field '(.+)'$/, () => {
    var e = cy.get('$3');
    e.type('$1{enter}');
    if ('.search-input .input[tabindex="1"]' != 'undefined') {
        e.type('.search-input .input[tabindex="1"]');
    }

})
defineStep(/^I choose the search operator '(.+)'$/, () => {
    cy.get('soti-dropdown-node i.ngui-icon-operator$1').click();

})
defineStep(/^I enter search value '(.+)'$/, () => {
    var e = cy.get('$3');
    e.type('$1');
    if ('.search-input .input[tabindex="3"]' != 'undefined') {
        e.type('.search-input .input[tabindex="3"]');
    }

})
defineStep(/^I click on search DONE$/, () => {
    cy.get('search-dropdown .primary').click();

})
defineStep(/^I start the search$/, () => {
    cy.get('.query-button-base.search-button.highlight').click();

})
defineStep(/^I expect device count to be '(.+)'$/, () => {
    cy.get('[id="device-count"] span:nth-child(2)').should('have.html', '$1');

})
defineStep(/^I click on the clear query button$/, () => {
    cy.get('.query-button-base.clear-button').click();

})