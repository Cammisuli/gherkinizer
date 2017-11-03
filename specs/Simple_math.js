describe(`Simple math`, () => {
    beforeEach(`Logging in`, () => {
        /**
         * Please create a step for 'Given I log in'
         */
    })

    it(`easy math`, () => {
        /** Given a variable set to '1' */
        var test = 1;
        /** When I increment the variable by '1' */
        console.log(1);
        /** Then the variable should contain 2 */
        assert(2).equal(2);
        /** And I do something else */
        document.querySelectorAll('input').click();
    });

    it(`much more complex stuff`, () => {
        /** Given a variable set to '100' */
        var test = 100;
        /** When I increment the variable by '5' */
        console.log(5);
        /** Then the variable should contain 105 */
        assert(105).equal(105);
        /** But I do something else */
        document.querySelectorAll('input').click();
    });

    it(`much more complex stuff`, () => {
        /** Given a variable set to '99' */
        var test = 99;
        /** When I increment the variable by '1234' */
        console.log(1234);
        /** Then the variable should contain 1333 */
        assert(1333).equal(1333);
        /** But I do something else */
        document.querySelectorAll('input').click();
    });

    it(`much more complex stuff`, () => {
        /** Given a variable set to '12' */
        var test = 12;
        /** When I increment the variable by '5' */
        console.log(5);
        /** Then the variable should contain 18 */
        assert(18).equal(18);
        /** But I do something else */
        document.querySelectorAll('input').click();
    });

});