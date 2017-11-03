Step(/^Basic Steps to do (.+) and (.+)$/, () => {
    /** Given a variable set to '$1' */
    var test = $1;

    /** Then the variable should contain $2 */
    assert($2).equal($2);

})