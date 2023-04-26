// Import the required modules and functions
const fs = require("fs");
const path = require("path");
const os = require("os");
const prettier = require("prettier");

const {
  recursiveRendering,
  getFolderPrefix,
  capitalize,
  createDir,
  pascalCase,
} = require("./src/helpers/functions");
const defaultPath = process.cwd();

const config = require("./config.json");

// Set up the file extension for loading jsx files
require.extensions[".jsx"] = (module, filename) => {
  module.exports = fs.readFileSync(filename, "utf8");
};

// Define some constants from the configuration
const {
  outputDir,
  templatesFolder,
  silentMode,
  defaultComponentType,
  defaultRootComponentName,
} = config;

const minifiedCss =
  "div,span{border:1px solid #111;padding:8px;min-width:16px;min-height:16px;display:block;margin:12px;box-shadow:4px 4px 4px 4px #11111130}";

// Define a helper function for managing errors
function manageError(err, message) {
  if (err) {
    console.warn(err);
  }
  if (!silentMode) {
    console.log(message);
  }
}

// Define the main export object
module.exports = {
  // Returns a JSX component tag for the given component name and type
  getComponentTag(componentName, componentType = defaultComponentType) {
    const propsParameter =
      componentType === "functional"
        ? `{...props.${componentName}}`
        : `{...this.props.${componentName}}`;
    return `<${pascalCase(componentName)} ${propsParameter} />`;
  },

  // Returns a JSX tag for the given prop and type
  getProp(prop, componentType = defaultComponentType) {
    const propsParameter =
      componentType === "functional"
        ? `{props.${prop.name}}`
        : `{this.props.${prop.name}}`;
    return `<span className='${capitalize(
      prop.name
    )}'>${propsParameter}</span>`;
  },

  // Returns an import statement for the given component name
  getComponentImport(componentName) {
    return `import ${pascalCase(componentName)} from './${pascalCase(
      componentName
    )}/${pascalCase(componentName)}';`;
  },

  // Returns the data and base filename for a given JSON file
  getDataFromFile(filename) {
    const baseFilename = path.basename(filename, ".json");
    const data = require(filename);
    return { baseFilename, data };
  },

  // Writes a CSS file for the given base filename and folder prefix
  writeCss(baseFilename, folderPrefix) {
    const outputDirectoryPath = path.join(
      defaultPath,
      outputDir,
      `${folderPrefix}_${baseFilename}`
    );
    const cssPrettified = prettier.format(minifiedCss, {
      semi: true,
      parser: "css",
    });
    const cssDestFile = path.join(
      outputDirectoryPath,
      `${defaultRootComponentName}.css`
    );
    fs.writeFileSync(cssDestFile, cssPrettified);
    manageError(null, `The file ${cssDestFile} was created!`);
  },

  // Manages the data and returns the properties and children
  manageData(data) {
    const dataProps = [];
    const dataChildren = [];
    if (typeof data === "object") {
      if (data.constructor !== Array) {
        Object.keys(data).forEach((item) => {
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
        const firstItem = Array.isArray(data) ? data[0] : data;
        if (typeof firstItem === "object" && firstItem !== null) {
          Object.keys(data[0]).forEach((item) => {
            switch (typeof data[0][item]) {
              case "boolean":
              case "string":
              case "number":
                dataProps.push({
                  name: item,
                  value: data[0][item],
                });
                break;
              case "object":
                if (data[0][item]) {
                  if (data[0][item].constructor !== Array) {
                    dataChildren.push(item);
                  }
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

  // Writes a component file for the given data and filenames
  writeComponent(
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
      // For root array just get the first element
      if (!parentComponentName && data.constructor === Array) {
        data = data[0];
      }
      if (typeof data === "object") {
        const { dataProps, dataChildren } = this.manageData(data);
        const template = require(`${templatesFolder}/${componentType}-component.jsx`, "UTF8");
        const component = recursiveRendering(template, {
          name: pascalCase(componentName),
          childComponent: dataChildren
            .map((child) => this.getComponentTag(child, componentType))
            .join(""),
          className: pascalCase(componentName),
          importCssStatement:
            depth === 0 ? `import './${componentName}.css';` : "",
          importChildStatement: dataChildren
            .map((child) => this.getComponentImport(child))
            .join(os.EOL),
          props: dataProps
            .map((prop) => this.getProp(prop, componentType))
            .join(os.EOL),
        });
        let appDir, dir, filename;
        const outputSubdir = `${folderPrefix}_${baseFilename}`;
        componentName = pascalCase(componentName);
        if (parentComponentName) {
          if (depth === 1) {
            appDir = path.join(defaultPath, outputDir, outputSubdir);
          } else {
            appDir = path.join(
              defaultPath,
              outputDir,
              outputSubdir,
              parentComponentName
            );
          }
          if (depth > 2) {
            appDir = path.dirname(parentFilename);
          }
          createDir(appDir);
          dir = path.join(appDir, componentName);
          createDir(dir);
          filename = path.join(dir, `${componentName}.jsx`);
        } else {
          appDir = path.join(defaultPath, outputDir, outputSubdir);
          dir = path.join(appDir, "/");
          filename = path.join(dir, `${componentName}.js`);
          createDir(appDir);
          createDir(dir);
        }
        const componentPrettified = prettier.format(component, {
          semi: true,
          parser: "babel",
        });
        fs.writeFileSync(filename, componentPrettified);
        manageError(null, `The file ${filename} was created!`);
        dataChildren.forEach((child) => {
          this.writeComponent(
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
      }
    }
  },

  // Writes a root component for the given JSON file
  getRootComponent(componentName, filename, defaultFolderPrefix) {
    const { baseFilename, data } = this.getDataFromFile(filename);
    componentName = pascalCase(componentName);
    const folderPrefix = getFolderPrefix(defaultFolderPrefix);
    this.writeComponent(
      data,
      baseFilename,
      componentName,
      "functional",
      null,
      0,
      filename,
      folderPrefix
    );
    this.writeCss(baseFilename, folderPrefix);
  },
};
