const fs = require('fs');
const defaultPath = process.cwd();
const statefullComponent = require('./react-templates/state-full-component');
//const data = require('./data');
const data = require('./swapi');

module.exports = {
    mixData: function (NAME,data) {
        let result;
        let template = statefullComponent.statefullComponent(NAME,data);
        result = template;
        return result;
    },
    test: function(){
        let res = module.exports.mixData("TEST");
        console.log(res);
    },
    parse: function(){
        const items = Object.keys(data).map( item => {
            if(data[item] && typeof data[item] === "object"){
                module.exports.saveToFile(item,data[item]);
            }
        } );
    },
    saveToFile: function(NAME,data){
        let res = module.exports.mixData(NAME,data);
        const dir = `${defaultPath}/output/${NAME}`;
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }
        fs.appendFile(`${dir}/${NAME}.jsx`, res, function(err) {
            if(err) {
                return console.log(err);
            }
            console.log(`The file ${dir}/${NAME}.jsx was saved!`);
        }); 
    },

}

module.exports.parse();
