import React, { Component } from 'react'; 
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
}