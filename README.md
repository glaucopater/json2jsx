# Json2jsx

A Node.js library (requires **Node 18+**) that turns a JSON view model into a tree of React components. It reads structure from your JSON, fills JSX templates, formats with Prettier, and writes files under `output/`.

## Features

- Nested **objects** → child components
- **Arrays of objects** → one component per item (`.map()` in the parent)
- **Arrays of primitives** → comma-separated text with a label
- **Image-like fields** (`thumbnailUrl`, `heroImage`, `avatar`, …) → `<img>` plus caption
- **Scalar fields** → labeled text (`Title: …`, `Summary: …`)
- **Functional** (default) or **statefull** (class) templates via `config.json`

## Quick start (browser preview)

Recommended: the [media gallery](#media-gallery-sample) sample (nested objects, lists, images).

```bash
yarn demo:gallery
yarn playground:install   # once
yarn playground             # http://localhost:5173
```

The playground loads `json_samples/media-gallery.json` when `VITE_OUTPUT_DIR` starts with `gallery` (as with `yarn demo:gallery`). Otherwise it uses `json_samples/test.json`.

Minimal sample:

```bash
yarn demo
yarn playground
```

Regenerate and open the dev server:

```bash
yarn start
```

(`yarn start` runs `yarn demo` then `yarn playground`; run `yarn playground:install` first if you have never installed playground dependencies.)

### Preview another generated folder

After `yarn generate json_samples/nasa.open.api.json nasa` (or any file + prefix):

```powershell
# Windows PowerShell
$env:VITE_OUTPUT_DIR="nasa_nasa.open.api"; yarn playground
```

```bash
# macOS / Linux
VITE_OUTPUT_DIR=nasa_nasa.open.api yarn playground
```

The playground template is copied from [`scripts/playground/`](scripts/playground/) into gitignored `output/playground/`.

## Scripts

| Script | Description |
|--------|-------------|
| `yarn demo` | Generate from `json_samples/test.json` → `output/test_run_test/` |
| `yarn demo:gallery` | Generate from `json_samples/media-gallery.json` → `output/gallery_media-gallery/` |
| `yarn generate -- <file.json> [prefix]` | Custom input (via `node cli.js`) |
| `yarn playground:setup` | Copy playground template only |
| `yarn playground:install` | Setup + `yarn install` in `output/playground/` |
| `yarn playground` | Sync template and start Vite |
| `yarn start` | `yarn demo` + `yarn playground` |
| `yarn test` | Jest suite |

## Command line

```bash
json2jsx path/to/data.json
json2jsx path/to/data.json my_prefix
```

With `defaultFolderPrefix: "currentdate"` in [`config.json`](config.json), output folders look like `output/20260531143000_data/`.

Typical layout:

```text
output/<prefix>_<basename>/
  App.js
  App.css
  ComponentA/
    ComponentA.jsx
    SubComponentB/
      SubComponentB.jsx
```

- Root component: `App.js` (name from `defaultRootComponentName`)
- Nested components: `.jsx` under subfolders

## Media gallery sample

[`json_samples/media-gallery.json`](json_samples/media-gallery.json) uses [Glauco Pater’s Unsplash photos](https://unsplash.com/@glaucopater) and demonstrates:

- Page metadata (title, summary, tags, hero image)
- Nested `author` → `contact`
- `gallery.items[]` with thumbnails and metadata
- `highlights[]` and `relatedLinks[]` as lists

```bash
yarn demo:gallery
```

Generated parents render lists roughly like:

```jsx
{props.highlights?.map((item, index) => (
  <Highlights key={index} {...item} />
))}
```

Scalar fields are labeled in the JSX, for example:

```jsx
<span className="Title">
  <strong>Title:</strong> {props.title}
</span>
```

## Using output in your own React app

1. Generate components (see above).
2. Import the root `App.js` and pass the same JSON shape as props:

```jsx
import App from "./output/gallery_media-gallery/App.js";
import data from "./json_samples/media-gallery.json";

<App {...data} />;
```

3. Or wire only the subtree you need, matching the generated prop names (`page`, `author`, etc.).

For Create React App, CodeSandbox, or similar, point the entry file at the generated root and pass your JSON file as props (see tutorial images below).

![Tutorial Step 5](/tutorial/json2jsx_tutorial_step_5.jpg)

![Tutorial Step 6](/tutorial/json2jsx_tutorial_step_6.jpg)

## How generation works

```text
JSON file → manageData (props vs children) → JSX templates → Prettier → output/
```

- **Objects** → child component + import
- **Arrays of objects** → child component; parent uses `.map()` to render each item
- **Arrays of primitives** → single labeled span with `.join(", ")`
- **null** → empty string prop
- **Image-like keys** → `<figure>` with `<img>` and `<figcaption>`

Generated CSS outlines the component tree (borders/boxes) so structure is visible before you style for production.

## Configuration

[`config.json`](config.json):

| Option | Default | Description |
|--------|---------|-------------|
| `outputDir` | `./output` | Output directory |
| `templatesFolder` | `./src/react-templates` | `functional` / `statefull` templates |
| `silentMode` | `false` | Log each created file when `false` |
| `defaultComponentType` | `functional` | `functional` or `statefull` |
| `defaultRootComponentName` | `App` | Root file base name |
| `defaultFolderPrefix` | `currentdate` | Folder prefix; `currentdate` = timestamp |
| `cleanUpTestOutput` | `true` | Delete test output after `yarn test` |

## Programmatic API

`getRootComponent` is async (Prettier 3):

```javascript
const json2jsx = require("json2jsx");

await json2jsx.getRootComponent("App", "./data.json", "my_prefix");
```

Sync helpers include `manageData`, `getProp`, `getComponentTag`, and `getDataFromFile`.

## Caveats

- Input must use a `.json` extension.
- Component shape for arrays is inferred from the **first element** only; you may need to hand-edit templates for heterogeneous lists.
- Config key **`statefull`** is the legacy spelling for class-based templates.
- Image fields use a **name heuristic**; rename keys or edit generated JSX for full control.
- Playground and `output/` are local dev aids; only `index.js`, `cli.js`, `config.json`, and `src/` ship on npm (`package.json` `files`).

## Samples in this repo

| File | Purpose |
|------|---------|
| `json_samples/test.json` | Small tree (`yarn demo`) |
| `json_samples/media-gallery.json` | Nested objects, lists, images (`yarn demo:gallery`) |
| `json_samples/nasa.open.api.json` | Large real-world API payload |
| `json_samples/pokemon.json`, `anapioficeandfire.json`, … | More fixtures |

When installed from npm, samples also appear under `node_modules/json2jsx/json_samples/`.

### External APIs used by sample JSON

- [NASA Open API](https://api.nasa.gov/#getting-started)
- [A Song of Ice and Fire API](https://anapioficeandfire.com)
- [Pokémon API](https://pokeapi.co/api/v2/pokemon/ditto)
- [ISS Position API](http://api.open-notify.org/iss-now.json)

More lists: [easy APIs without auth](https://shkspr.mobi/blog/2016/05/easy-apis-without-authentication), [public-apis](https://github.com/toddmotto/public-apis).

## Development

```bash
yarn install
yarn test
```

CI runs tests on Node 18, 20, and 22 (see [`.github/workflows/ci.yml`](.github/workflows/ci.yml)).

## Background

React apps often mirror a JSON (or JSON-like) view model. The mapping is rarely one-to-one, but nested objects and arrays frequently match components and lists. Json2jsx bootstraps that folder structure so you can refine markup and styling afterward.

## Thanks

[Andrea Falzetti](http://andreafalzetti.github.io/blog/2016/10/22/render-es6-javascript-template-literals-contained-variable.html) for the template-literal approach that avoids `eval` / `new Function`.
