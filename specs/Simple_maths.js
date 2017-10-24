describe(`Simple maths`, () => {
    describe(`easy maths`, () => {
        it(`Given a variable set to '1'`, () => {
    var test = 1;
});
        it(`When I increment the variable by '1'`, () => {
    console.log(1);
});
        it(`Then the variable should contain 2`, () => {
    assert(2).equal(2);
});
    });
    describe(`much more complex stuff`, () => {
        it(`Given a variable set to '100'`, () => {
    var test = 100;
});
        it(`When I increment the variable by '5'`, () => {
    console.log(5);
});
        it(`Then the variable should contain 105`, () => {
    assert(105).equal(105);
});
    });
    describe(`much more complex stuff`, () => {
        it(`Given a variable set to '99'`, () => {
    var test = 99;
});
        it(`When I increment the variable by '1234'`, () => {
    console.log(1234);
});
        it(`Then the variable should contain 1333`, () => {
    assert(1333).equal(1333);
});
    });
    describe(`much more complex stuff`, () => {
        it(`Given a variable set to '12'`, () => {
    var test = 12;
});
        it(`When I increment the variable by '5'`, () => {
    console.log(5);
});
        it(`Then the variable should contain 18`, () => {
    assert(18).equal(18);
});
    });
});