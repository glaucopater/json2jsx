const fs = require('fs');
const path = require('path');
var os = require("os");
const {
    recursive_rendering,
    getCurrentDate,
    capitalize,
    createDir,
    pascalCase
} = require('./helpers/functions');
const defaultPath = process.cwd();
const prettier = require("prettier");
const {
    outputDir,
    templatesFolder,
    silentMode,
    defaultComponentType
} = require('./options.json');

require.extensions['.jsx'] = function (module, filename) {
    module.exports = fs.readFileSync(filename, 'utf8');
};


const currentDate = getCurrentDate();

module.exports = {
    getComponentTag: function (componentName) {
        return `<${pascalCase(componentName)} />`;
    },
    getProp: function (prop, componentType) {
        if (componentType === "statefull")
            return `<span className='${capitalize(prop.name)}'>{this.props.${prop.name}}</span>`;
        else
            return `<span className='${capitalize(prop.name)}'>{props.${prop.name}}</span>`;
    },
    getComponentImport: function (componentName) {
        return `import ${pascalCase(componentName)} from './${pascalCase(componentName)}/${pascalCase(componentName)}';`
    },
    getDataFromFile: function (filename) {
        return {
            baseFilename: path.basename(filename, '.json'),
            data: require(filename)
        };
    },
    writeComponent: function (data, baseFilename, componentName, componentType = defaultComponentType, parentComponentName, depth, parentFilename) {
        if (data) {
            //for root array just get the first element 

            if (!parentComponentName && data.constructor === Array) {
                data = data.constructor !== Array ? data : (data[0] ? data[0] : []);
            }
            if (typeof data === "object") {
                let dataProps = [];
                let dataChildren = [];
                if (data.constructor !== Array) {
                    Object.keys(data).map(item => {
                        switch (typeof data[item]) {
                            case "bool":
                            case "string":
                            case "number":
                            case "datetime":
                                dataProps.push({
                                    name: item,
                                    value: data[item]
                                });
                                break;
                            case "object":
                                if (data[item]) {
                                    dataChildren.push(item);
                                } else {
                                    dataProps.push({
                                        name: item,
                                        value: ''
                                    });
                                }
                                break;
                            default:
                                break;
                        }
                    });
                } else {
                    if (typeof data[0] === "object") {
                        const firstItem = data[0];
                        Object.keys(firstItem).map((item) => {
                            switch (typeof firstItem[item]) {
                                case "bool":
                                case "string":
                                case "number":
                                case "datetime":
                                    dataProps.push({
                                        name: item,
                                        value: firstItem[item]
                                    });
                                    break;
                                case "object":
                                    if (firstItem[item]) {
                                        dataChildren.push(item);
                                    } else {
                                        dataProps.push({
                                            name: item,
                                            value: ''
                                        });
                                    }
                                    break;
                                default:
                                    break;
                            }
                        });
                    }
                }
                const template = require(`${templatesFolder}/${componentType}-component.jsx`, 'UTF8');

                const component = recursive_rendering(template, {
                    name: pascalCase(componentName),
                    childComponent: dataChildren.map(child => {
                        return module.exports.getComponentTag(child)
                    }).join(''),
                    className: pascalCase(componentName),
                    importChildStatement: dataChildren.map(child => {
                        return module.exports.getComponentImport(child)
                    }).join(os.EOL),
                    props: dataProps.map(prop => {
                        return module.exports.getProp(prop, componentType)
                    }).join(os.EOL)
                });

                let appDir, dir, filename;
                const outputSubdir = currentDate + '_' + baseFilename;
                componentName = pascalCase(componentName);
                if (parentComponentName) {
                    if (depth === 1) {
                        appDir = `${defaultPath}/${outputDir}/${outputSubdir}`;
                    } else {
                        appDir = `${defaultPath}/${outputDir}/${outputSubdir}/${parentComponentName}`;
                    }
                    //in testing
                    if (depth > 2) {
                        appDir = path.dirname(parentFilename);
                    }
                    createDir(appDir);
                    dir = `${appDir}/${componentName}`;
                    createDir(dir);
                    filename = `${dir}/${componentName}.jsx`;
                } else {
                    appDir = `${defaultPath}/${outputDir}/${outputSubdir}`;
                    dir = `${appDir}/`;
                    filename = `${dir}/${componentName}.js`;
                    createDir(appDir);
                    createDir(dir);
                }
                const componentPrettified = prettier.format(component, {
                    semi: true,
                    parser: "babel"
                });
                fs.appendFile(filename, componentPrettified, function (err) {
                    if (err) {
                        return console.warn(err);
                    }
                    if (!silentMode) {
                        console.log(`The file ${filename} was created!`);
                    }
                });

                if (data.constructor !== Array) {
                    dataChildren.map(child => {
                        module.exports.writeComponent(data[child], baseFilename, child, defaultComponentType, componentName, (depth + 1), filename);
                    });
                } else {
                    const firstItem = data[0];
                    dataChildren.map(child => {
                        module.exports.writeComponent(firstItem[child], baseFilename, child, defaultComponentType, componentName, (depth + 1), filename);
                    });
                }

            }
        }
    },
    getRootComponent: function (componentName, filename) {
        const {
            baseFilename: baseFilename,
            data: data
        } = module.exports.getDataFromFile(filename);
        componentName = pascalCase(componentName);
        module.exports.writeComponent(data, baseFilename, componentName, "stateless", null, 0, filename);
    }
}