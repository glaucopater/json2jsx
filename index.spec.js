const index = require('./index');

test('_recursive_rendering', () => {
    const st = "import React, { Component } from 'react'; ${importChildStatement} export default class ${name} extends Component { }";
    expect(index._recursive_rendering(st,{name:'Test', importChildStatement:''})).toBe("import React, { Component } from 'react';  export default class Test extends Component { }");
});

test('getCurrentDate', () => {
    expect(index.getCurrentDate().length).toBeGreaterThan(10);
});

test('capitalize', () => {
    expect(index.capitalize("abc")).toBe("Abc");
});






