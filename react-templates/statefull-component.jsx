import React, { Component } from 'react'; 
${importChildStatement}
const style = {
    borderWidth: 1,
    borderColor: '#000'
};
export default class ${name} extends Component { 
    componentDidMount() {
        console.log(this.props);
    }
    render() {
        return (
            <div className='${className}' style={style}>
                ${props}
                ${childComponent}
                {Object.values(this.props).map((p, index) => (
                <div key={index}>{p}</div>
                ))}
            </div>
        )
    }
}