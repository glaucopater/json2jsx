# Json2jsx
A node js library to transform a json view model (plain .json file) into a set of statefull components.

Abstract and heuristic assumption
===
In every project or prototype using React JS I found, a json structure is always present.
Generally the mapping of the view model is not 100% reflected into the UI, but many parts of the structures are.

I.e. if inside a json file there is an array of objects, it is very likely that on UI side there will be a collection of sub components.

Json --> Jsx file(s) with same structure found inside the Json



Command line usage
===
json2jsx data.json

This will create a folder structure inside the working directory as follows:

* /output/%datetime%_%data%/App.jsx
* /output/%datetime%_%data%/Component1/Component1.jsx
* /output/%datetime%_%data%/Component2/Component2.jsx
* /output/%datetime%_%data%/Component3/SubComponent1/SubComponent1.jsx

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
import React, { Component } from 'react'; 

export default class Game_indices extends Component { 
    componentDidMount() {
        console.log(this.props);
    }
    render() {
        return (
            <div className='Game_indices'>
                
            </div>
        )
    }
}
```

or for a json with this structure

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

The output component will be:

```javascript
import React, { Component } from 'react'; 
import PropertyC from './PropertyC/PropertyC';
export default class Sample extends Component { 
    componentDidMount() {
        console.log(this.props);
    }
    render() {
        return (
            <div className='Sample'>
                <PropertyC />
            </div>
        )
    }
}
```

Caveat
===
At the moment input file(s) must have .json extension otherwise this will raise an error.

Options
===
Default options are the following ones:

* outputDir: "./output"
* silentMode: true
* defaultComponentType: "statefull"
* defaultRootComponentName: "App"

Test
===

I have included some sample json files in order to test different scenarios. They are stored inside the module folder (node_modules/json2jsx/json_samples/)

The sources are:
* [The Star Wars API](https://swapi.co/) 
* [Game of Thrones API](https://anapioficeandfire.com)
* [Pokemon API](https://pokeapi.co/api/v2/pokemon/ditto) 
* [ISS Position API](http://api.open-notify.org/iss-now.json)

You can find other APIs here:
* https://shkspr.mobi/blog/2016/05/easy-apis-without-authentication
* https://www.diycode.cc/projects/toddmotto/public-apis

Thanks to 
[andrea falzetti] (
http://andreafalzetti.github.io/blog/2016/10/22/render-es6-javascript-template-literals-contained-variable.html)
for letting me skip the usage of eval/new Function
