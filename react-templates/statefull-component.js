module.exports = {
templateFunction: function(name,child){
const childComponent = child ? `<${child} />` : '';
const importChildStatement = child ? `import ${child} from '../${child}/${child}.jsx'` : '';
return `import React, { Component } from 'react'; ${importChildStatement}  
export default class ${name} extends Component { 
    componentDidMount() {
        console.log(this.props);
    }
    render() {
        return (
            <div className='${name}'>
                ${childComponent}
            </div>
        )
    }
}`;
}
};