const { recursive_rendering , getCurrentDate, capitalize  } = require('./functions');

test('recursive_rendering', () => {
    const st = "import React, { Component } from 'react'; ${importChildStatement} export default class ${name} extends Component { }";
    expect(recursive_rendering(st,{ name: 'Test', importChildStatement: ''})).toBe("import React, { Component } from 'react';  export default class Test extends Component { }");
});

test('getCurrentDate', () => {
    expect(getCurrentDate().length).toBeGreaterThan(10);
});

test('capitalize', () => {
    expect(capitalize("abc")).toBe("Abc");
});