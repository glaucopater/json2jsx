module.exports = {
templateFunction: function(name,child,isChild){
const childComponent = !isChild ? `<${child} />` : '';
const importChildStatement = !isChild ? `import ${child} from './${child}/${child}'` : '';
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