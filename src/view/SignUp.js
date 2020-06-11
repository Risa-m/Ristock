import React from 'react'
import { Link } from 'react-router-dom'
import firebase, { db } from '../firebase'
import './views.css';

export class SignUp extends React.Component{ 
  constructor(){
    super()
  }

  render(){

    return(
        <div className="signup-root">
          <p>ご利用にはGoogleアカウントでのログインが必要です。</p>
          <Link to="login" title="Sign in with Google Account">
            <img src="image/google_signin_normal.png" width="180" alt="Sign in with Google"/>
          </Link>
        </div>
    )
  }

}