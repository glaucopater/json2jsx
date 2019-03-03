import React from 'react'; 
${importChildStatement}
const ${name} = (props) => { 
    return (
        <div className='${className}'>
            ${props}
            ${childComponent}
        </div>
    )
}
export default ${name};