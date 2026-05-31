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
  isImageProp,
  getPropLabel,
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
  "div,span,figure{border:1px solid #111;padding:8px;min-width:16px;min-height:16px;display:block;margin:12px;box-shadow:4px 4px 4px 4px #11111130}strong{display:inline;margin-right:4px}img{max-width:280px;height:auto;display:block;margin:8px;border:1px solid #333}figcaption{font-size:12px;margin-top:4px}";

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
  getPropsRoot(componentType = defaultComponentType) {
    return componentType === "functional" ? "props" : "this.props";
  },

  getComponentTag(
    componentName,
    componentType = defaultComponentType,
    childData
  ) {
    const child = pascalCase(componentName);
    const path = `${this.getPropsRoot(componentType)}.${componentName}`;
    if (Array.isArray(childData)) {
      return `{${path}?.map((item, index) => (
        <${child} key={index} {...item} />
      ))}`;
    }
    return `<${child} {...${path}} />`;
  },

  getPropValueExpression(prop, componentType = defaultComponentType) {
    const path = `${this.getPropsRoot(componentType)}.${prop.name}`;
    if (prop.valueType === "array") {
      return `Array.isArray(${path}) ? ${path}.join(", ") : ${path}`;
    }
    return path;
  },

  getProp(prop, componentType = defaultComponentType) {
    const className = capitalize(prop.name);
    const label = getPropLabel(prop.name);
    const valueExpression = this.getPropValueExpression(prop, componentType);
    const propsParameter = `${this.getPropsRoot(componentType)}.${prop.name}`;

    if (isImageProp(prop.name)) {
      return `<figure className='${className}'><img src={${propsParameter}} alt="${label}" /><figcaption><strong>${label}:</strong> {${valueExpression}}</figcaption></figure>`;
    }

    return `<span className='${className}'><strong>${label}:</strong> {${valueExpression}}</span>`;
  },

  normalizeComponentData(data) {
    if (!Array.isArray(data)) {
      return data;
    }
    const objectItem = data.find(
      (item) => item && typeof item === "object" && !Array.isArray(item)
    );
    if (objectItem) {
      return objectItem;
    }
    let current = data;
    while (Array.isArray(current) && current.length > 0) {
      current = current[0];
    }
    if (current && typeof current === "object" && !Array.isArray(current)) {
      return current;
    }
    return {};
  },

  arrayShouldBeChild(value) {
    if (!Array.isArray(value) || value.length === 0) {
      return false;
    }
    const first = value[0];
    if (typeof first === "object" && first !== null) {
      return true;
    }
    return false;
  },

  classifyProperty(name, value) {
    if (value === null || value === undefined) {
      return { kind: "prop", name, value: "" };
    }
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return { kind: "prop", name, value: "" };
      }
      if (this.arrayShouldBeChild(value)) {
        return { kind: "child", name };
      }
      return {
        kind: "prop",
        name,
        value: value.map(String).join(", "),
        valueType: "array",
      };
    }
    if (typeof value === "object") {
      return { kind: "child", name };
    }
    return { kind: "prop", name, value };
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
    const source = this.normalizeComponentData(data);
    if (typeof source === "object" && source !== null && !Array.isArray(source)) {
      Object.keys(source).forEach((key) => {
        const classified = this.classifyProperty(key, source[key]);
        if (classified.kind === "child") {
          dataChildren.push(classified.name);
        } else {
          dataProps.push({
            name: classified.name,
            value: classified.value,
            ...(classified.valueType
              ? { valueType: classified.valueType }
              : {}),
          });
        }
      });
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
      data = this.normalizeComponentData(data);
      if (typeof data === "object" && data !== null && !Array.isArray(data)) {
        const { dataProps, dataChildren } = this.manageData(data);
        const template = loadTemplate(componentType);
        const component = recursiveRendering(template, {
          name: pascalCase(componentName),
          childComponent: dataChildren
            .map((child) =>
              this.getComponentTag(child, componentType, data[child])
            )
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
