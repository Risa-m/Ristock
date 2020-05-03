import React from 'react'
import { Link } from "react-router-dom";
import firebase, { db } from '../firebase';
import Button from '@material-ui/core/Button';

export class Home extends React.Component {

  constructor(props){
    super(props)

    this.state = {
      user: this.props.user
    }
  }
  
  render(){

    if(this.props.user){
      return (
        <div>
          <ul>
            <li><Link to='/'>Home</Link></li>
            <li><Link to='/stocks/add'>Add Stocks</Link></li>
            <li><Link to='/stocks'>List</Link></li>
            {(this.state.isSigned)? <li><Button onClick={this.logout}>logout</Button></li> : null
            }
          </ul>

          <p>logged in at Home</p>
          <Link to="stocks">stocks list</Link>
        </div>

      )
    }else{

    return (
      <div className="home-root">
          please <Link to={"/login"}>login</Link>...
      </div>
      )
    }
  }
}


