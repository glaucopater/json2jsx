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

const {
  outputDir,
  templatesFolder,
  silentMode,
  defaultComponentType,
  defaultRootComponentName,
} = config;

const minifiedCss =
  "div,span{border:1px solid #111;padding:8px;min-width:16px;min-height:16px;display:block;margin:12px;box-shadow:4px 4px 4px 4px #11111130}";

function loadTemplate(componentType) {
  const templatePath = path.join(
    defaultPath,
    templatesFolder,
    `${componentType}-component.jsx`
  );
  return fs.readFileSync(templatePath, "utf8");
}

function manageError(err, message) {
  if (err) {
    console.warn(err);
  }
  if (!silentMode) {
    console.log(message);
  }
}

module.exports = {
  getComponentTag(componentName, componentType = defaultComponentType) {
    const propsParameter =
      componentType === "functional"
        ? `{...props.${componentName}}`
        : `{...this.props.${componentName}}`;
    return `<${pascalCase(componentName)} ${propsParameter} />`;
  },

  getProp(prop, componentType = defaultComponentType) {
    const propsParameter =
      componentType === "functional"
        ? `{props.${prop.name}}`
        : `{this.props.${prop.name}}`;
    return `<span className='${capitalize(
      prop.name
    )}'>${propsParameter}</span>`;
  },

  getComponentImport(componentName) {
    return `import ${pascalCase(componentName)} from './${pascalCase(
      componentName
    )}/${pascalCase(componentName)}';`;
  },

  getDataFromFile(filename) {
    if (path.extname(filename).toLowerCase() !== ".json") {
      throw new Error(`Input file must have a .json extension: ${filename}`);
    }
    const baseFilename = path.basename(filename, ".json");
    const data = JSON.parse(fs.readFileSync(filename, "utf8"));
    return { baseFilename, data };
  },

  async writeCss(baseFilename, folderPrefix) {
    const outputDirectoryPath = path.join(
      defaultPath,
      outputDir,
      `${folderPrefix}_${baseFilename}`
    );
    createDir(outputDirectoryPath);
    const cssPrettified = await prettier.format(minifiedCss, {
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

  manageData(data) {
    const dataProps = [];
    const dataChildren = [];
    if (typeof data === "object" && data !== null) {
      if (!Array.isArray(data)) {
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
      } else if (data.length > 0) {
        const firstItem = data[0];
        if (typeof firstItem === "object" && firstItem !== null) {
          Object.keys(firstItem).forEach((item) => {
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
                  if (!Array.isArray(firstItem[item])) {
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

  async writeComponent(
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
      if (!parentComponentName && Array.isArray(data)) {
        data = data[0];
      }
      if (typeof data === "object" && data !== null) {
        const { dataProps, dataChildren } = this.manageData(data);
        const template = loadTemplate(componentType);
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
        const componentPrettified = await prettier.format(component, {
          semi: true,
          parser: "babel",
        });
        fs.writeFileSync(filename, componentPrettified);
        manageError(null, `The file ${filename} was created!`);
        for (const child of dataChildren) {
          await this.writeComponent(
            data[child],
            baseFilename,
            child,
            defaultComponentType,
            componentName,
            depth + 1,
            filename,
            folderPrefix
          );
        }
      }
    }
  },

  async getRootComponent(componentName, filename, defaultFolderPrefix) {
    const { baseFilename, data } = this.getDataFromFile(filename);
    componentName = pascalCase(componentName);
    const folderPrefix = getFolderPrefix(defaultFolderPrefix);
    await this.writeComponent(
      data,
      baseFilename,
      componentName,
      "functional",
      null,
      0,
      filename,
      folderPrefix
    );
    await this.writeCss(baseFilename, folderPrefix);
  },
};
