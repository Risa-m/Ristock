import React from 'react'
import { Link } from 'react-router-dom'
import 'asset/views.css';

import Paper from '@material-ui/core/Paper';

export class SignUp extends React.Component{ 
  constructor(){
    super()
  }

  render(){

    return(
        <div className="signup-root">
          <h2>ログイン・新規登録</h2>
          <Paper variant="outlined" className="signup-outline">
          <p>お持ちのアカウントで登録/ログイン</p>
            <div className="signup-logo-image">
              <Link to="login" title="Sign in with Google Account">
                <img src="image/google_signin_normal.png" width="180" alt="Sign in with Google"/>
              </Link>
            </div>
          </Paper>
        </div>
    )
  }

}