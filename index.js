const fs = require('fs');
const moment = require('moment');
const defaultPath = process.cwd();
const statefullComponent = require('./react-templates/statefull-component');
const statelessComponent = require('./react-templates/stateless-component'); 
const outputDir = './output';

module.exports = {
    mixData: function (name,child,isChild) {
        let result;
        let template = statefullComponent.templateFunction(name,child,isChild);
        result = template;
        return result;
    },
    parse: function(filename){ 
        const data = require(filename);
        if(data){
        const items = Object.keys(data).map( item => {
            let child;
            if(data[item] && typeof data[item] === "object"){
                if(data[item].constructor !== Array){
                    Object.keys(data[item]).map( subitem => {
                        if(data[item][subitem] && typeof data[item][subitem] === "object"){
                            child = subitem;
                        }
                    });
                    if(child){
                        module.exports.saveToFile(item,child,true);
                    }
                }
                module.exports.saveToFile(item, child, false);
            }
        });
        }
    },
    saveToFile: function(name, child, isChild){
        name = module.exports.capitalize(name);
        if(child){
            child = module.exports.capitalize(child);
        }
        let res = module.exports.mixData(name,child,isChild);
        const m = moment().format('YYYYMMDD-HHmm');
        if (!fs.existsSync(`${defaultPath}/output/${m}`)){
            fs.mkdirSync(`${defaultPath}/output/${m}`);
        }
        let appDir, dir, filename;
        if(isChild){
            appDir = `${defaultPath}/output/${m}/${name}`;
            if (!fs.existsSync(appDir)){
                fs.mkdirSync(appDir);
            }
            dir = `${appDir}/${child}`;
            if (!fs.existsSync(dir)){
                fs.mkdirSync(dir);
            }
            filename = `${dir}/${child}.jsx`;
        }
        else {
            appDir = `${defaultPath}/output/${m}`;
            dir = `${appDir}/${name}`;
            filename = `${dir}/${name}.jsx`;
        }
            
        if (!fs.existsSync(appDir)){
            fs.mkdirSync(appDir);
        }
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }
        fs.appendFile(filename, res, function(err) {
            if(err) {
                return console.log(err);
            }
            console.log(`The file ${filename}.jsx was saved!`);
        }); 
    },
    capitalize: function(name) {
        const [first, ...other] = name; 
        const capitalizedName =  [first.toUpperCase()].concat(other).join("");
        return capitalizedName; 
    }
}

if(process.argv[2] && fs.existsSync(process.argv[2])){
    if (!fs.existsSync(outputDir)){
        fs.mkdirSync(outputDir);
    }

    const inputFile = process.argv[2];
    module.exports.parse(inputFile);
}
else 
    console.log('No input file selected');