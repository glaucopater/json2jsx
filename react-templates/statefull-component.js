module.exports = {
templateFunction: function(name, child, isChild){
name = !isChild ? name : child;
const childComponent = !isChild && child && child !== "undefined" ? `<${child} />` : '';
const importChildStatement = !isChild && child && child !== "undefined" ? `import ${child} from './${child}/${child}';` : '';
const className = !isChild ? name : child;

return `import React, { Component } from 'react'; 
${importChildStatement}
export default class ${name} extends Component { 
    componentDidMount() {
        console.log(this.props);
    }
    render() {
        return (
            <div className='${className}'>
                ${childComponent}
            </div>
        )
    }
}`;
}
};