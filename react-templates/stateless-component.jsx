import React from 'react'; 
${importChildStatement}
const style = {
    borderWidth: 1,
    borderColor: '#000'
};
const ${name} = (props) => { 
    return (
        <div className='${className}'style={style}>
            ${props}
            ${childComponent}
        </div>
    )
}
export default ${name};