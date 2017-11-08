/**
 * THIS IS AN AUTO GENERATED FILE, PLEASE DO NOT EDIT
 */

describe(`POC tests`, () => {
    beforeEach(``, () => {
        /** Given I initialize the test environment for feature 'POC_tests' */
        cy.server();
        cy.route(/api/).as('api');

        // send feature name to e2e server
        //cy.request('POST', 'http://localhost:8282/actions/feature/POC_tests');;

        /** And I open the login page */
        cy.visit('https://localhost/WebConsole/login');;

        /** And I enter username '1' */
        var e = cy.get('[placeholder="Username"]');
        e.type('1');
        if ('undefined' != 'undefined') {
            e.type('undefined');
        };

        /** And I enter password '1' */
        var e = cy.get('[placeholder="Password"]');
        e.type('1');
        if ('undefined' != 'undefined') {
            e.type('undefined');
        };

        /** And I click on the LOG_IN button */
        cy.get('.primary').click();;

        /** And I wait for all api responses */
        cy.wait('@api');;

    })

    it(`A search that returns no results`, () => {
        /** When I click on the search entry box */
        cy.get('.TailCursorContent').click();
        /** And I enter search field 'Device Name' */
        var e = cy.get('.search-input .input[tabindex="1"]');
        e.type('Device Name');
        if ('{enter}' != 'undefined') {
            e.type('{enter}');
        }
        /** And I choose the search operator 'is' */
        cy.get('soti-dropdown-node i.ngui-icon-operatoris').click();
        /** And I enter search value '12345' */
        var e = cy.get('.search-input .input[tabindex="3"]');
        e.type('12345');
        if ('undefined' != 'undefined') {
            e.type('undefined');
        }
        /** And I click on search DONE */
        cy.get('search-dropdown .primary').click();
        /** And I start the search */
        cy.get('.query-button-base.search-button.highlight').click();
        /** And I wait for all api responses */
        cy.wait('@api');
        /** Then I expect device count to be '(0 / 0)' */
        cy.get('[id="device-count"] span:nth-child(2)').should('have.html', '(0 / 0)');
    });

    it(`Clear the previous search`, () => {
        /** Given I click on the clear query button */
        cy.get('.query-button-base.clear-button').click();
    });

});