const fs = require("fs");
const path = require("path");
var os = require("os");
const {
  recursive_rendering,
  getFolderPrefix,
  capitalize,
  createDir,
  pascalCase,
} = require("./helpers/functions");
const defaultPath = process.cwd();
const prettier = require("prettier");
const {
  outputDir,
  templatesFolder,
  silentMode,
  defaultComponentType,
  defaultRootComponentName,
} = require("./options.json");

require.extensions[".jsx"] = function (module, filename) {
  module.exports = fs.readFileSync(filename, "utf8");
};

module.exports = {
  getComponentTag: function (componentName, componentType) {
    const propsParameter =
      componentType === "functional"
        ? `{...props.${componentName}}`
        : `{...this.props.${componentName}}`;
    return `<${pascalCase(componentName)} ${propsParameter} />`;
  },
  getProp: function (prop, componentType) {
    const propsParameter =
      componentType === "functional"
        ? `{props.${prop.name}}`
        : `{this.props.${prop.name}}`;
    return `<span className='${capitalize(
      prop.name
    )}'>${propsParameter}</span>`;
  },
  getComponentImport: function (componentName) {
    return `import ${pascalCase(componentName)} from './${pascalCase(
      componentName
    )}/${pascalCase(componentName)}';`;
  },
  getDataFromFile: function (filename) {
    return {
      baseFilename: path.basename(filename, ".json"),
      data: require(filename),
    };
  },
  writeCss: function (baseFilename, folderPrefix) {
    let appDir = `${defaultPath}/${outputDir}/${folderPrefix}_${baseFilename}`;
    const minifiedCss =
      "div,span{border:1px solid #000;padding:6px;min-width:10px;min-height:10px;display:block;margin:12px;box-shadow:3px 3px 3px 3px #00000030}";
    const cssPrettified = prettier.format(minifiedCss, {
      semi: true,
      parser: "css",
    });

    const cssDestFile = `${appDir}/${defaultRootComponentName}.css`;
    fs.writeFileSync(cssDestFile, cssPrettified, function (err) {
      if (err) {
        return console.warn(err);
      }
      if (!silentMode) {
        console.log(`The file ${cssDestFile} was created!`);
      }
    });
  },
  manageData: function (data) {
    let dataProps = [];
    let dataChildren = [];
    if (typeof data === "object") {
      if (data.constructor !== Array) {
        Object.keys(data).map((item) => {
          switch (typeof data[item]) {
            case "boolean":
            case "string":
            case "number":
              dataProps.push({
                name: item,
                value: data[item],
              });
              break;
            case "object":
              if (data[item]) {
                dataChildren.push(item);
              } else {
                dataProps.push({
                  name: item,
                  value: "",
                });
              }
              break;
            default:
              break;
          }
        });
      } else {
        //to focus
        if (typeof data[0] === "object") {
          const firstItem = data[0];
          Object.keys(firstItem).map((item) => {
            switch (typeof firstItem[item]) {
              case "boolean":
              case "string":
              case "number":
                dataProps.push({
                  name: item,
                  value: firstItem[item],
                });
                break;
              case "object":
                if (firstItem[item]) {
                  if (firstItem[item].constructor !== Array)
                    dataChildren.push(item);
                } else {
                  dataProps.push({
                    name: item,
                    value: "",
                  });
                }
                break;
              default:
                break;
            }
          });
        }
      }
    }
    return { dataProps, dataChildren };
  },
  writeComponent: function (
    data,
    baseFilename,
    componentName,
    componentType = defaultComponentType,
    parentComponentName,
    depth,
    parentFilename,
    folderPrefix
  ) {
    if (data) {
      //for root array just get the first element
      if (!parentComponentName && data.constructor === Array) {
        data = data.constructor !== Array ? data : data[0] ? data[0] : [];
      }
      if (typeof data === "object") {
        let { dataProps, dataChildren } = this.manageData(data);

        const template = require(`${templatesFolder}/${componentType}-component.jsx`, "UTF8");
        const component = recursive_rendering(template, {
          name: pascalCase(componentName),
          childComponent: dataChildren
            .map((child) => {
              return module.exports.getComponentTag(child, componentType);
            })
            .join(""),
          className: pascalCase(componentName),
          importCssStatement:
            depth === 0 ? `import './${componentName}.css';` : "",
          importChildStatement: dataChildren
            .map((child) => {
              return module.exports.getComponentImport(child);
            })
            .join(os.EOL),
          props: dataProps
            .map((prop) => {
              return module.exports.getProp(prop, componentType);
            })
            .join(os.EOL),
        });

        let appDir, dir, filename;
        const outputSubdir = folderPrefix + "_" + baseFilename;
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
        //this must be executed after each string literal replacement!!!
        const componentPrettified = prettier.format(component, {
          semi: true,
          parser: "babel",
        });
        fs.writeFileSync(filename, componentPrettified, function (err) {
          if (err) {
            return console.warn(err);
          }
          if (!silentMode) {
            console.log(`The file ${filename} was created!`);
          }
        });
        if (data.constructor !== Array) {
          dataChildren.map((child) => {
            module.exports.writeComponent(
              data[child],
              baseFilename,
              child,
              defaultComponentType,
              componentName,
              depth + 1,
              filename,
              folderPrefix
            );
          });
        } else {
          const firstItem = data[0];
          dataChildren.map((child) => {
            module.exports.writeComponent(
              firstItem[child],
              baseFilename,
              child,
              defaultComponentType,
              componentName,
              depth + 1,
              filename,
              folderPrefix
            );
          });
        }
      }
    }
  },
  getRootComponent: function (componentName, filename, defaultFolderPrefix) {
    const {
      baseFilename: baseFilename,
      data: data,
    } = module.exports.getDataFromFile(filename);
    componentName = pascalCase(componentName);
    const folderPrefix = getFolderPrefix(defaultFolderPrefix);
    module.exports.writeComponent(
      data,
      baseFilename,
      componentName,
      "functional",
      null,
      0,
      filename,
      folderPrefix
    );

    module.exports.writeCss(baseFilename, folderPrefix);
  },
};
