Feature: POC tests

Background:
    Given I initialize the test environment for feature 'POC_tests'
    And I open the login page
    And I enter username '1'
    And I enter password '1'
    And I click on the LOG_IN button
    And I wait for all api responses
    And I do this thing
    Then I do something else again

Scenario: A search that returns no results
    When I click on the search entry box
    And I enter search field 'Device Name'
    And I choose the search operator 'is'
    And I enter search value '12345'
    And I click on search DONE
    And I start the search
    And I wait for all api responses
    Then I expect device count to be '(0 / 0)'
    But I do something funky
  
Scenario: Clear the previous search
    Given I click on the clear query button