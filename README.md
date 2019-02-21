# Json2jsx
A node js library to transform a json view model (simple .json file) into a set of statefull components.

Abstract and heuristic assumption
===
In every project or prototype using React JS I found, a json structure is always present.
Generally the mapping of the view model is not 100% reflected into the UI, but many parts of the structures are.

I.e. if inside a json file there is an array it is very likely that on UI side there will be a collection of sub-components.

Json ---> Jsx File(s) with same structure found inside the Json



Command line usage
===
json2jsx data.json

This will create a folder structure inside the working directory as follows:

* /output/%datetime%/Component1
* /output/%datetime%/Component2
* /output/%datetime%/Component3/SubComponent1


Plus a component container (default is "App"), containing the first component found.

Every state-full react component (.jsx files) will be generated according to the existing template:

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
or
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

I have included some sample json files in order to test different scenarios. They are stored inside the module folder (node_modules/json2jsx/json_samples/

The sources are:
* [https://swapi.co/] The Star Wars API
* [https://anapioficeandfire.com] Game of Thrones API) 
* [https://pokeapi.co/api/v2/pokemon/ditto] Pokemon API
* [http://api.open-notify.org/iss-now.json] ISS Position API 

You can find other APIs here:
* https://shkspr.mobi/blog/2016/05/easy-apis-without-authentication
* https://www.diycode.cc/projects/toddmotto/public-apis
