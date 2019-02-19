

const fs = require('fs'); 
const defaultPath = process.cwd();
const statefullComponent = require('./react-templates/statefull-component'); 
const outputDir = './output';

module.exports = {
    getCurrentDate: function() {
            const dateToken = []; 
            now = new Date();
            year = now.getFullYear();
            dateToken.push(year);
            month = (now.getMonth() + 1); if (month.length == 1) { month = "0" + month; }
            dateToken.push(month);
            day = now.getDate(); if (day.length == 1) { day = "0" + day; }
            dateToken.push(day);
            hour = now.getHours(); if (hour.length == 1) { hour = "0" + hour; }
            dateToken.push(hour);
            minute = now.getMinutes(); if (minute.length == 1) { minute = "0" + minute; }
            dateToken.push(minute);
            second = now.getSeconds(); if (second.length == 1) { second = "0" + second; }
            dateToken.push(second);
            return dateToken.join('');
    },
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
        const m = module.exports.getCurrentDate();
        if (!fs.existsSync(`${defaultPath}/${outputDir}/${m}`)){
            fs.mkdirSync(`${defaultPath}/${outputDir}/${m}`);
        }
        let appDir, dir, filename;
        if(isChild){
            appDir = `${defaultPath}/${outputDir}/${m}/${name}`;
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
