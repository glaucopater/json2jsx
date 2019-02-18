module.exports = {
    statefullComponent: function(NAME,data){
        return `import React, { Component } from 'react'; \
        export default class ${NAME} extends Component { \
            componentDidMount() {\ 
                console.log(this.props);\
            }\
            render() {\
                return (\
                    <div>${NAME}</div>\
                )\
            }\
        }`
    }
};