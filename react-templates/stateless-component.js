module.exports = {
templateFunction: function(name, child, isChild){ 
name = !isChild ? name : child;
const childComponent = !isChild && child && child !== "undefined" ? `<${child} />` : '';
const importChildStatement = !isChild && child && child !== "undefined" ? `import ${child} from './${child}/${child}';` : '';
const className = !isChild ? name : child;

return `import React from 'react';
${importChildStatement}
const ${name} = () => { 
    return (
        <div className='${className}'>
            ${childComponent}
        </div>
    )
}
export default ${name};`;
}
};