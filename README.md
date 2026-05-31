# Json2jsx

A Node.js library (requires **Node 18+**) that transforms a JSON view model (a plain `.json` file) into a set of stateful or stateless React components.

## Quick start (browser preview)

Generate components, then scaffold a local Vite preview under `output/playground/` (gitignored, created on demand):

```bash
yarn demo
yarn playground:install   # once: copies scripts/playground → output/playground, installs deps
yarn playground           # dev server → http://localhost:5173
```

Generate and preview in one step:

```bash
yarn start
```

To preview a different generated folder (after `yarn generate <file.json> <prefix>`):

```powershell
# Windows PowerShell
$env:VITE_OUTPUT_DIR="my_prefix_basename"; yarn playground
```

```bash
# macOS / Linux
VITE_OUTPUT_DIR=my_prefix_basename yarn playground
```

The playground template lives in [`scripts/playground/`](scripts/playground/); `output/playground/` is ephemeral.

## How to use it

### Step 1

Create an empty React project (for example with [Create React App](https://github.com/facebook/create-react-app)) **or** create a sandbox on [CodeSandbox](https://codesandbox.io/).

### Step 2

Create or download a JSON file. Sample files are in [`json_samples/`](json_samples/). Example:

- [nasa.open.api.json](https://raw.githubusercontent.com/glaucopater/json2jsx/master/json_samples/nasa.open.api.json)

### Step 3

Run json2jsx with the JSON file as the first argument. It creates a folder of React components that mirror the JSON structure.

```bash
yarn demo
# or
json2jsx json_samples/nasa.open.api.json
```

### Step 4

Point your app entry file at the generated root component (`App.js` by default; rename via `config.json`). Run your dev server (for example `yarn start` in a CRA app, usually http://localhost:3000).

### Step 5 (optional)

Pass the JSON data as props to see values rendered:

```jsx
import App from "./path/to/output/.../App.js";
import data from "./nasa.open.api.json";

<App {...data} />;
```

![Tutorial Step 5](/tutorial/json2jsx_tutorial_step_5.jpg)

### Step 6 (optional)

The tool is datatype-agnostic. Adjust generated components or prop markup as needed—for example, map `HdUrl` and `url` to images or links.

![Tutorial Step 6](/tutorial/json2jsx_tutorial_step_6.jpg)

### Styling

Generated output includes a small CSS file that outlines the component tree so you can see structure before customizing styles.

## Command line usage

```bash
json2jsx data.json
json2jsx data.json my_folder_prefix
```

Output layout (with `defaultFolderPrefix` set to `currentdate`, folders look like `YYYYMMDDHHmmss_data`):

- `output/<prefix>_<data>/App.js`
- `output/<prefix>_<data>/Component1/Component1.jsx`
- `output/<prefix>_<data>/Component2/Component2.jsx`
- `output/<prefix>_<data>/Component3/SubComponent1/SubComponent1.jsx`

Child components use `.jsx`; the root component is `.js` by default.

### Example input (JSON)

```json
{
  "game_indices": [
    {
      "game_index": 132,
      "version": {
        "name": "white-2",
        "url": "https://pokeapi.co/api/v2/version/22/"
      }
    }
  ]
}
```

### Example output (class / `statefull` template)

```javascript
import React, { Component } from "react";

export default class Game_indices extends Component {
  componentDidMount() {
    console.log(this.props);
  }
  render() {
    return <div className="Game_indices"></div>;
  }
}
```

### Another input shape

```json
{
  "sample": {
    "propertyA": "string",
    "propertyB": [1, 2, 3],
    "propertyC": {
      "subProperty1": 123,
      "subProperty2": "abc"
    }
  }
}
```

### Matching output

```javascript
import React, { Component } from "react";
import PropertyC from "./PropertyC/PropertyC";

export default class Sample extends Component {
  componentDidMount() {
    console.log(this.props);
  }
  render() {
    return (
      <div className="Sample">
        <PropertyC />
      </div>
    );
  }
}
```

## Caveats

- Input files must use the `.json` extension or generation will fail.
- Root JSON arrays only use the **first** element to infer shape.
- Config key `statefull` is intentional (legacy spelling) for class-based templates.

## Configuration

Defaults live in [`config.json`](config.json):

| Option | Default | Description |
|--------|---------|-------------|
| `outputDir` | `./output` | Writable folder for generated files |
| `templatesFolder` | `./src/react-templates` | Component templates |
| `silentMode` | `false` | When `false`, log file creation messages |
| `defaultComponentType` | `functional` | `functional` or `statefull` (class components) |
| `defaultRootComponentName` | `App` | Root component base name |
| `defaultFolderPrefix` | `currentdate` | Output folder prefix; `currentdate` → timestamp |
| `cleanUpTestOutput` | `true` | Remove integration-test output after `yarn test` |

## Programmatic usage

`getRootComponent` is async (Prettier 3 formats output asynchronously):

```javascript
const json2jsx = require("json2jsx");

await json2jsx.getRootComponent("App", "./data.json", "my_prefix");
```

## Test

```bash
yarn test
```

Sample JSON files for manual runs are in [`json_samples/`](json_samples/). When installed from npm, they also appear under `node_modules/json2jsx/json_samples/`.

### Sample data sources

- [NASA Open API](https://api.nasa.gov/#getting-started)
- [The Star Wars API](https://swapi.co/)
- [A Song of Ice and Fire API](https://anapioficeandfire.com)
- [Pokémon API](https://pokeapi.co/api/v2/pokemon/ditto)
- [ISS Position API](http://api.open-notify.org/iss-now.json)

More public APIs:

- [Easy APIs without authentication](https://shkspr.mobi/blog/2016/05/easy-apis-without-authentication)
- [public-apis (toddmotto)](https://github.com/toddmotto/public-apis)

## Background

In most React projects, a JSON (or JSON-like) view model sits behind the UI. The mapping is rarely one-to-one, but nested objects and arrays often correspond to components and lists. Json2jsx generates JSX files that follow the same nesting as your JSON.

## Thanks

[Andrea Falzetti](http://andreafalzetti.github.io/blog/2016/10/22/render-es6-javascript-template-literals-contained-variable.html) for the template-literal approach that avoids `eval` / `new Function`.
