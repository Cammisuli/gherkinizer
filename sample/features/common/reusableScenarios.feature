Feature: reusable-steps
    This is a file to create reusable Scenarios

Scenario: I open the MobiControl login page
    Given I navigate to the url 'https://localhost/MobiControl/WebConsole/login'

Scenario: I open the MobiControl devices page
    Given I navigate to the url 'https://localhost/MobiControl/WebConsole/devices'

Scenario: I enter username '$1'
    Given I enter text '$1' into '[placeholder="Username"]'

Scenario: I enter password '$1'
    Given  I enter text '$1' into '[placeholder="Password"]'

Scenario: I click on the LOG_IN button
    Given I click on '.primary'

Scenario: I click on the search entry box
    Given I click on '.TailCursorContent'

Scenario: I enter search field '$1'
    Given I enter text '$1{enter}' into '.search-input .input[tabindex="1"]'

# search operators: 'is', 'isnot', 'contains', 'containsnot', 'startswith', 'startswithnot', 'endswith', 'endswithnot'
Scenario: I choose the search operator '$1'
    Given I click on 'soti-dropdown-node i.ngui-icon-operator$1'

Scenario: I enter search value '$1'
    Given I enter text '$1' into '.search-input .input[tabindex="3"]'

Scenario: I click on search DONE
    Given I click on 'search-dropdown .primary'

Scenario: I start the search
    Given I click on '.query-button-base.search-button.highlight'

Scenario: I expect device count to be '$1'
    Then '[id="device-count"] span:nth-child(2)' contains '$1'

Scenario: I click on the clear query button
    Given I click on '.query-button-base.clear-button'
