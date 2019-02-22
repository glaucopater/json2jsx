const fs = require('fs');
const path = require('path');
const defaultPath = process.cwd(); 
const {
    outputDir,
    templatesFolder,
    silentMode,
    defaultComponentType,
    defaultRootComponentName
} = require('./options.json');

module.exports = {

    _recursive_rendering: function (string, context, stack) {
        for (var key in context) {
            if (context.hasOwnProperty(key)) {
                if (typeof context[key] === "object") {
                    string = _recursive_rendering(string, context[key], (stack ? stack + '.' : '') + key);
                } else {
                    var find = '\\$\\{\\s*' + (stack ? stack + '.' : '') + key + '\\s*\\}';
                    var re = new RegExp(find, 'g');
                    string = string.replace(re, context[key]);
                }
            }
        }
        return string;
    },
    getCurrentDate: function () {
        const dateToken = [];
        now = new Date();
        dateToken.push(now.getFullYear());
        month = (now.getMonth() + 1);
        if (month.length == 1) {
            month = "0" + month;
        }
        dateToken.push(month);
        day = now.getDate();
        if (day.length == 1) {
            day = "0" + day;
        }
        dateToken.push(day);
        hour = now.getHours();
        if (hour.length == 1) {
            hour = "0" + hour;
        }
        dateToken.push(hour);
        minute = now.getMinutes();
        if (minute.length == 1) {
            minute = "0" + minute;
        }
        dateToken.push(minute);
        second = now.getSeconds();
        if (second.length == 1) {
            second = "0" + second;
        }
        dateToken.push(second);
        return dateToken.join('');
    },
    getComponentTemplate: function (name, child, isChild, componentType) {
        const template = fs.readFileSync(`${templatesFolder}/${componentType}-component.jsx`, 'UTF8');
        name = !isChild ? name : child;
        const childComponent = !isChild && child && child !== "undefined" ? `<${child} />` : '';
        const importChildStatement = !isChild && child && child !== "undefined" ? `import ${child} from './${child}/${child}';` : '';
        const className = !isChild ? name : child;

        return module.exports._recursive_rendering(template, {
            name: name,
            child: child,
            childComponent: childComponent,
            className: className,
            importChildStatement: importChildStatement
        });
    },
    parse: function (filename) {
        let data = require(filename);
        const baseFilename = path.basename(filename, '.json');
        if (data) {
            //for root array just get the first element 
            data = data.constructor !== Array ? data : data[0];

            let rootCreated = false;
            const items = Object.keys(data).map(item => {
                //create root container
                if (!rootCreated && typeof data[item] === "object") {
                    module.exports.saveToFile(defaultRootComponentName, item, false, baseFilename, "stateless", true);
                    rootCreated = true;
                }
                let child;
                if (data[item] && typeof data[item] === "object") {
                    if (data[item].constructor !== Array) {
                        Object.keys(data[item]).map(subitem => {
                            if (data[item][subitem] && typeof data[item][subitem] === "object") {
                                child = subitem;
                            }
                        });
                        if (child) {
                            module.exports.saveToFile(item, child, true, baseFilename, defaultComponentType);
                        }
                    }
                    module.exports.saveToFile(item, child, false, baseFilename, defaultComponentType);
                }
            });
        }
    },
    saveToFile: function (name, child, isChild, sourcefilename, componentType, isRoot) {
        name = module.exports.capitalize(name);
        if (child) {
            child = module.exports.capitalize(child);
        }
        let res = module.exports.getComponentTemplate(name, child, isChild, componentType);
        const m = module.exports.getCurrentDate() + '_' + sourcefilename;
        if (!fs.existsSync(`${defaultPath}/${outputDir}/${m}`)) {
            fs.mkdirSync(`${defaultPath}/${outputDir}/${m}`);
        }
        let appDir, dir, filename;
        if (isRoot) {
            appDir = `${defaultPath}/output/${m}`;
            dir = `${appDir}/`;
            filename = `${dir}/${name}.jsx`;
        } else if (isChild) {
            appDir = `${defaultPath}/${outputDir}/${m}/${name}`;
            if (!fs.existsSync(appDir)) {
                fs.mkdirSync(appDir);
            }
            dir = `${appDir}/${child}`;
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
            filename = `${dir}/${child}.jsx`;
        } else {
            appDir = `${defaultPath}/output/${m}`;
            dir = `${appDir}/${name}`;
            filename = `${dir}/${name}.jsx`;
        }
        if (!fs.existsSync(appDir)) {
            fs.mkdirSync(appDir);
        }
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        fs.appendFile(filename, res, function (err) {
            if (err) {
                return console.warn(err);
            }
            if (!silentMode) {
                console.log(`The file ${filename} was saved!`);
            }
        });
    },
    capitalize: function (name) {
        const [first, ...other] = name;
        const capitalizedName = [first.toUpperCase()].concat(other).join("");
        return capitalizedName;
    }
}