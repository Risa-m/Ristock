import React from 'react';
import { Redirect } from 'react-router-dom';

export class Login extends React.Component {
  constructor(props){
    super(props)
  }

  render(){
    if(this.props.user === null){
      return <p>please login.</p>
    }
    else{
      return (
        <Redirect to="/stocks"></Redirect>
      )
    }
  }
}