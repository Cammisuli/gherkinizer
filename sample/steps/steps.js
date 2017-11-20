Given(/^a variable set to '(.+)'$/, `var test = $1;`)

When(/^I increment the variable by '(.+)'$/, () => {
    console.log($1);
})

Then(/^the variable should contain (.+)/, () => {
    assert($1).equal($1);
})

/**
 * Sample
 */
defineStep(/^I do something else$/, () => {
    document.querySelectorAll('input').click();
})

defineStep(/^I initialize the test environment for feature '(.*)'$/, () => {
	cy.server();
	cy.route(/api/).as('api');

	// send feature name to e2e server
	//cy.request('POST', 'http://localhost:8282/actions/feature/$1');
})

defineStep(/^I login as user '(.*)' and password '(.*)'$/, () => {
	cy.loginByJSON('$1', '$2');
	cy.wait('@api');
})

defineStep(/^I navigate to the url '(.+)'$/, () => {
	cy.visit('$1');
})

defineStep(/^I click on '(.*)'$/, () => {
	cy.get('$1').click();
})

defineStep(/^I enter text '(.+?)({.+)?' into '(.*)'$/, () => {
	/**
	 *  ___  ___  _______   ___       ___       ________          ________  ___  ___       ___          
	 * |\  \|\  \|\  ___ \ |\  \     |\  \     |\   __  \        |\   __  \|\  \|\  \     |\  \         
	 * \ \  \\\  \ \   __/|\ \  \    \ \  \    \ \  \|\  \       \ \  \|\ /\ \  \ \  \    \ \  \        
	 *  \ \   __  \ \  \_|/_\ \  \    \ \  \    \ \  \\\  \       \ \   __  \ \  \ \  \    \ \  \       
	 *   \ \  \ \  \ \  \_|\ \ \  \____\ \  \____\ \  \\\  \       \ \  \|\  \ \  \ \  \____\ \  \____  
	 *    \ \__\ \__\ \_______\ \_______\ \_______\ \_______\       \ \_______\ \__\ \_______\ \_______\
	 *     \|__|\|__|\|_______|\|_______|\|_______|\|_______|        \|_______|\|__|\|_______|\|_______|
	 *                                                                                                  
	 *                                                                                                  
	 *                                                                                                  
	 */ 
	var e = cy.get('$3');
	e.type('$1');
	if ('$2' != 'undefined') {
		e.type('$2');
	}
})

Then(/^'(.*)' contains '(.*)'$/, () => {
	cy.get('$1').should('have.html', '$2');
})

defineStep(/^I wait for all api responses$/, () => {
	cy.wait('@api');
})

defineStep(/^I wait for '(.*)' seconds$/, () => {
	cy.wait($1 * 1000);
})

defineStep(/^I do this thing$/, () => {

	/**
	 *  ___          ________  ________          _________  ___  ___  ___  ________           _________  ___  ___  ___  ________   ________     
	 * |\  \        |\   ___ \|\   __  \        |\___   ___\\  \|\  \|\  \|\   ____\         |\___   ___\\  \|\  \|\  \|\   ___  \|\   ____\    
	 * \ \  \       \ \  \_|\ \ \  \|\  \       \|___ \  \_\ \  \\\  \ \  \ \  \___|_        \|___ \  \_\ \  \\\  \ \  \ \  \\ \  \ \  \___|    
	 *  \ \  \       \ \  \ \\ \ \  \\\  \           \ \  \ \ \   __  \ \  \ \_____  \            \ \  \ \ \   __  \ \  \ \  \\ \  \ \  \  ___  
	 *   \ \  \       \ \  \_\\ \ \  \\\  \           \ \  \ \ \  \ \  \ \  \|____|\  \            \ \  \ \ \  \ \  \ \  \ \  \\ \  \ \  \|\  \ 
	 *    \ \__\       \ \_______\ \_______\           \ \__\ \ \__\ \__\ \__\____\_\  \            \ \__\ \ \__\ \__\ \__\ \__\\ \__\ \_______\
	 *     \|__|        \|_______|\|_______|            \|__|  \|__|\|__|\|__|\_________\            \|__|  \|__|\|__|\|__|\|__| \|__|\|_______|
	 *                                                                       \|_________|                                                       
	 *                                                                                                                                          
	 *    HEHE                                                                                                                                      
	 */
})