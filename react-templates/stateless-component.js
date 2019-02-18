module.exports = {
templateFunction: function(name,child){
const childComponent = child ? `<${child} />` : '';
return `import React from 'react'; 
const ${name} = () => { 
    return (
        <div className='${name}'>
            ${childComponent}
        </div>
    )
}
export default ${name};`;
}
};