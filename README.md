# Json2jsx

A NodeJs library that transforms a json view model (a plain .json file) into a set of statefull or stateless components.

# How to use it

## Step 1:

Create an empty project for React JS (for example using [Create React App](https://github.com/facebook/) )

or

Create a new sandbox in [Codesandbox](https://codesandbox.io/)  

## Step 2:

Create or download any json file (at the bottom of this readme you can find different examples).

i.e nasa.open.api.json
[nasa.open.api.json](https://raw.githubusercontent.com/glaucopater/json2jsx/master/json_samples/nasa.open.api.json)

## Step 3:

Run json2jsx passing this json file as a parameter. This will create a folder containing any matching React component(s) according to the json structure.

i.e. 
json2jsx .\json_samples\nasa.open.api.json

## Step 4:

Edit the default index.js pointing to the new created App.js (the root component default filename, that can be changed modifying the options).
At this point you can already run npm start and see the result on your local node web server (usually running on localhost, port 3000)

## Step 5 (optional):

This step is totally optional but show the power of this tool.
Edit the previous index.js file passing the content of the json file as a prop:
i.e

<App {...require("./nasa.open.api.json")} />

Save and go back to the browser to check the difference!

![Tutorial Step 5](/tutorial/json2jsx_tutorial_step_5.jpg)

## Step 6 (optional)

At the moment the tool is agnostic respect to datatype and tag element, but this just looking at the page it is very easy to adjust any component or props.
I.e changing the HdUrl and url the UI becomes:

![Tutorial Step 6](/tutorial/json2jsx_tutorial_step_6.jpg)

## Note about the styling

There is small CSS that will show the structure of the components and subcomponents.

# Abstract and heuristic assumption (maybe boring part...)

In every project or prototype using React JS I found, a json structure is always present.
Generally the mapping of the view model is not 100% reflected into the UI, but many parts of the structures are.

I.e. if inside a json file there is an array of objects, it is very likely that on UI side there will be a collection of sub components.

Json --> Jsx file(s) with same structure found inside the Json

# Command line usage

json2jsx data.json

This will create a folder structure inside the working directory as follows:

- /output/%datetime%\_%data%/App.jsx
- /output/%datetime%\_%data%/Component1/Component1.jsx
- /output/%datetime%\_%data%/Component2/Component2.jsx
- /output/%datetime%\_%data%/Component3/SubComponent1/SubComponent1.jsx

Every state-full react component (.jsx files) will be generated according to the existing template:

For a json with this structure:

"game_indices": [{
"game_index": 132,
"version": {
"name": "white-2",
"url": "https://pokeapi.co/api/v2/version/22/"
}
}

The output component will be:

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

or for a json with this structure

```javascript
{
    "sample": {
      "propertyA": "string",
      "propertyB": [
        1,
        2,
        3
      ],
      "propertyC": {
        "subProperty1": 123,
        "subProperty2": "abc"
      }
    }
  }
```

The output component will be:

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

# Caveat

At the moment input file(s) must have .json extension otherwise this will raise an error.

# Options

Default options are the following ones:

- outputDir (default "./output").
  The folder used for the generated file, it needs to be writeable.

- templatesFolder (default: "./react-templates").
  The folder containing the template used by the library itself.

- silentMode (default: true).
  Show console message if set to false

- defaultComponentType (default: "statefull").
  It can be "statefull" or "functional".

- defaultRootComponentName (default: "App").
  The root component filename.

- defaultFolderPrefix: (default: "currentdate")
  The prefix used for the name of the main folder. With "currentdate" the folder will be prefixed with the current date

- cleanUpTestOutput: (default: true)
  Clean unit tests generated folders and files

# Test

npm run test

This will launch the test suite

I have included also some sample json files in order to test different scenarios.
They are stored inside the module folder (node_modules/json2jsx/json_samples/)

The sources of this json are:

- [NASA Open API](https://api.nasa.gov/#getting-started)
- [The Star Wars API](https://swapi.co/)
- [Game of Thrones API](https://anapioficeandfire.com)
- [Pokemon API](https://pokeapi.co/api/v2/pokemon/ditto)
- [ISS Position API](http://api.open-notify.org/iss-now.json)

You can find other APIs here:

- https://shkspr.mobi/blog/2016/05/easy-apis-without-authentication
- https://www.diycode.cc/projects/toddmotto/public-apis

Thanks to
[andrea falzetti](http://andreafalzetti.github.io/blog/2016/10/22/render-es6-javascript-template-literals-contained-variable.html)
for letting me skip the usage of eval/new Function
