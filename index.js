const fs = require('fs');
const defaultPath = process.cwd();
const statefullComponent = require('./react-templates/statefull-component');
const statelessComponent = require('./react-templates/stateless-component');
const data = require('./json_samples/data');
//const data = require('./json_samples/swapi');

module.exports = {
    mixData: function (name,child) {
        let result;
        let template = statefullComponent.templateFunction(name,child);
        result = template;
        return result;
    },
    test: function(){
        let res = module.exports.mixData("TEST");
        console.log(res);
    },
    parse: function(){
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
                        module.exports.saveToFile(child);
                    }
                }
                module.exports.saveToFile(item, child);
            }
        });
    },
    saveToFile: function(name,child){
        name = module.exports.capitalize(name);
        if(child){
            child = module.exports.capitalize(child);
        }
        let res = module.exports.mixData(name,child);
        const dir = `${defaultPath}/output/${name}`;
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }
        fs.appendFile(`${dir}/${name}.jsx`, res, function(err) {
            if(err) {
                return console.log(err);
            }
            console.log(`The file ${dir}/${name}.jsx was saved!`);
        }); 
    },
    capitalize: function(name) {
        const [first, ...other] = name; 
        const capitalizedName =  [first.toUpperCase()].concat(other).join("");
        return capitalizedName; 
    }

}

module.exports.parse();
