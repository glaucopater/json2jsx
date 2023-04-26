import React, { Component } from 'react';
${importCssStatement}
${importChildStatement}

export default class ${name} extends Component { 
    componentDidMount() {
        console.log(this.props);
    }
    render() {
        return (
            <div className='${className}' >
                ${props}
                ${childComponent}
                {Object.values(this.props).map((p, index) => (
                <div key={index}>{p}</div>
                ))}
            </div>
        )
    }
}