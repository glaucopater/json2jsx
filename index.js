

const fs = require('fs'); 
const path = require('path'); 
const defaultPath = process.cwd();
const statefullComponent = require('./react-templates/statefull-component'); 
const statelessComponent = require('./react-templates/stateless-component'); 
const { outputDir, silentMode, defaultComponentType, defaultRootComponentName } = require('./options.json'); 

module.exports = {
    getCurrentDate: function() {
            const dateToken = []; 
            now = new Date(); 
            dateToken.push(now.getFullYear());
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
    getComponentTemplate: function (name, child, isChild, componentType) {
        let template;
        switch(componentType){
            case "statefull": template = statefullComponent.templateFunction(name,child,isChild); break;
            case "stateless": template = statelessComponent.templateFunction(name,child,isChild); break;
            default: !silentMode && console.warn("No component type defined");
        }
        return template;
    },
    parse: function(filename){ 
        let data = require(filename);
        const baseFilename = path.basename(filename,'.json');
        if(data){
        //for root array just get the first element 
        data = data.constructor !== Array ? data : data[0];

        let rootCreated = false;
        const items = Object.keys(data).map( item => {
            //create root container
            if(!rootCreated && typeof  data[item] === "object"){
                module.exports.saveToFile(defaultRootComponentName, item, false, baseFilename, "stateless", true);
                rootCreated = true;
            }
            let child;
            if(data[item] && typeof data[item] === "object"){
                if(data[item].constructor !== Array){
                    Object.keys(data[item]).map( subitem => {
                        if(data[item][subitem] && typeof data[item][subitem] === "object"){
                            child = subitem;
                        }
                    });
                    if(child){
                        module.exports.saveToFile(item, child, true, baseFilename, defaultComponentType);
                    }
                }
                module.exports.saveToFile(item, child, false, baseFilename, defaultComponentType);
            }
        });
        }
    },
    saveToFile: function(name, child, isChild, sourcefilename, componentType, isRoot){
        name = module.exports.capitalize(name);
        if(child){
            child = module.exports.capitalize(child);
        }
        let res = module.exports.getComponentTemplate(name, child, isChild, componentType);
        const m = module.exports.getCurrentDate() + '_' + sourcefilename;
        if (!fs.existsSync(`${defaultPath}/${outputDir}/${m}`)){
            fs.mkdirSync(`${defaultPath}/${outputDir}/${m}`);
        }
        let appDir, dir, filename;
        if(isRoot){
            appDir = `${defaultPath}/output/${m}`;
            dir = `${appDir}/`;
            filename = `${dir}/${name}.jsx`;
        }
        else if(isChild){
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
                return console.warn(err);
            }
            if(!silentMode){
                console.log(`The file ${filename} was saved!`);
            }
        }); 
    },
    capitalize: function(name) {
        const [first, ...other] = name; 
        const capitalizedName =  [first.toUpperCase()].concat(other).join("");
        return capitalizedName; 
    }
}
