#!/usr/bin/env node
const json2react = require('./index');
const fs = require('fs');
var path = require("path");

const {
    outputDir,
    defaultRootComponentName
} = require('./options.json');

if(process.argv[2] && fs.existsSync(process.argv[2])){
    if (!fs.existsSync(outputDir)){
        fs.mkdirSync(outputDir);
    }
    const inputFile = process.argv[2];
    var absolutePath = path.resolve(inputFile); 
    json2react.getRootComponent(defaultRootComponentName, absolutePath);
}
else 
    console.log('No input file selected');