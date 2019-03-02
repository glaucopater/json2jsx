const fs = require('fs');
const path = require('path');
var os = require("os");
const { recursive_rendering , getCurrentDate, capitalize, createDir, log  } = require('./helpers/functions');
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


module.exports = {
    getComponentTag: function(componentName){
        return `<${capitalize(componentName)} />`;
    },
    getProp: function(prop){
        return `<span className='${capitalize(prop.name)}'>{props.${prop.name}}</span>`;
    },
    getComponentImport: function(componentName){ 
        return `import ${capitalize(componentName)} from './${capitalize(componentName)}/${capitalize(componentName)}';`
    },
    getDataFromFile: function(filename){
        return { baseFilename: path.basename(filename, '.json'), data: require(filename) }; 
    },
    writeComponent: function(data, baseFilename, componentName, componentType = defaultComponentType, parentComponentName, depth, parentFilename) { 
        if (data) {  
            //for root array just get the first element 
            
            if(!parentComponentName && data.constructor === Array){  
                data = data.constructor !== Array ? data : (data[0] ? data[0] : []);
            }
            if(typeof data === "object"){
                let dataProps = [];
                let dataChildren = []; 
                if (data.constructor !== Array){
                    Object.keys(data).map(item => {
                        switch(typeof data[item]){
                            case "bool":
                            case "string":
                            case "number":
                            case "datetime": dataProps.push({ name: item, value: data[item] }); break;
                            case "object": dataChildren.push(item); break;
                            default: break;
                        }
                    });
                } else {
                    /*
                    data.map((item) => {
                        switch(typeof item){
                            case "bool":
                            case "string":
                            case "number":
                            case "datetime": dataProps.push({ name: item, value: item }); break;
                            case "object": dataChildren.push(item); break;
                            default: break;
                        }
                });*/
            }
                const template = require(`${templatesFolder}/${componentType}-component.jsx`, 'UTF8'); 
                const component = recursive_rendering(template, {
                    name: capitalize(componentName), 
                    childComponent: dataChildren.map(child => { return module.exports.getComponentTag(child) }).join(''),
                    className: capitalize(componentName),
                    importChildStatement: dataChildren.map(child => { return module.exports.getComponentImport(child) }).join(os.EOL),
                    props: dataProps.map(prop => { return module.exports.getProp(prop) }).join(os.EOL)
                });
                let appDir, dir, filename;
                const outputSubdir  = getCurrentDate() + '_' + baseFilename;
                componentName = capitalize(componentName);
                if (parentComponentName) { 
                    if(depth === 1) { 
                        appDir = `${defaultPath}/${outputDir}/${outputSubdir}`;     
                    } else  {
                        appDir = `${defaultPath}/${outputDir}/${outputSubdir}/${parentComponentName}`;
                    }
                    //in testing
                    if(depth > 2){
                        appDir = path.dirname(parentFilename);
                    }
                    createDir(appDir);
                    dir = `${appDir}/${componentName}`;
                    createDir(dir);
                    filename = `${dir}/${componentName}.jsx`;
                } 
                else {  
                    appDir = `${defaultPath}/${outputDir}/${outputSubdir}`;
                    dir = `${appDir}/`;
                    filename = `${dir}/${componentName}.jsx`;
                    createDir(appDir);
                    createDir(dir);
                }
                componentPrettified = prettier.format(component, { semi: true, parser: "babel" } );
                fs.appendFile(filename, componentPrettified, function (err) {
                    if (err) {
                        return console.warn(err);
                    }
                    if (!silentMode) {
                        console.log(`The file ${filename} was created!`);
                    }
                });  

                if (data.constructor !== Array){
                dataChildren.map(child => { 
                    module.exports.writeComponent(data[child], baseFilename, child, defaultComponentType, componentName, (depth + 1), filename);
                });
                }
    
            }        
        }
    },
    getRootComponent: function(componentName, filename){
        const { baseFilename: baseFilename, data: data } =  module.exports.getDataFromFile(filename);
        componentName = capitalize(componentName);
        module.exports.writeComponent(data, baseFilename, componentName, "stateless", null, 0, filename);
    } 
}