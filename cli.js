#!/usr/bin/env node
const json2react = require('./index');
const fs = require('fs');
const outputDir = './output';

if(process.argv[2] && fs.existsSync(process.argv[2])){
    if (!fs.existsSync(outputDir)){
        fs.mkdirSync(outputDir);
    }
    const inputFile = process.argv[2];
    json2react.parse(inputFile);
}
else 
    console.log('No input file selected');