import React from 'react'
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom'
import { AddStock } from './AddStock.js'
import { StockList } from './StockList'

export class Stocks extends React.Component {
  constructor(props){
    super(props)
    console.log(props)
    const params_id = props.match.params.id
    console.log(params_id)

    this.state = {
      id: params_id,
    }
  }

  handleChange = (name, i) => event => {
  };

  handlePageChange = (page) => {
    console.log("page listener")
    this.setState({id: page})
  }

  render(){
    /*
    if (typeof this.state.id === 'undefined')  {
      return (<div><p>id '{this.state.id}' does not exist.</p></div>)    
    }*/

    if (this.state.id === 'add'){
      return (
        <AddStock pageListener={() => this.handlePageChange()} user={this.props.user}/>
      )
    }

    


    return (
      <div>
        <div className="button-margin">
          Stocks Pages
          <Link to='/'><Button variant="contained">OK</Button></Link>
        </div>
      </div>
    )  
  }
}


