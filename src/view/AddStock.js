import React from 'react'

export class AddStock extends React.Component {
  constructor(){
    super()

    this.state = {
      id: null,
      name: "",
      modelNumber: -1, //型番
      size: "",
      color: "",
      stockNumber: 0,
      price: -1,
      category: "",
    }

  }
  render(){
    return (
      <div className="add-stock-root">
        Add Stock
        <ul>
          
        </ul>
      </div>
      )
  }
}
