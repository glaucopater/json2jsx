import React from 'react'; 
${importChildStatement}
const ${name} = () => { 
    return (
        <div className='${className}'>
            ${childComponent}
        </div>
    )
}
export default ${name};