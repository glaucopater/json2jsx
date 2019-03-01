import React from 'react'; 
${importChildStatement}
const ${name} = () => { 
    return (
        <div className='${className}'>
            ${props}
            ${childComponent}
        </div>
    )
}
export default ${name};