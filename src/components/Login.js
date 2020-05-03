import React from 'react';
import { Redirect } from 'react-router-dom';
import { Button } from '@material-ui/core';

export class Login extends React.Component {
  constructor(props){
    super(props)
  }

  render(){
    
    if(this.props.user === null){
      console.log("login")
      return <p>please login (login)</p>
    }
    else{
      return (
        <Redirect to="/"></Redirect>
      )
    }
  }
}