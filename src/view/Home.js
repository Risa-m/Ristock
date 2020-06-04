import React from 'react'
import { Link } from "react-router-dom";
import './views.css';

export class Home extends React.Component {

  constructor(props){
    super(props)

    this.state = {
      user: this.props.user,
      userID: this.props.userID,
    }
  }

  render(){
    return (
      <div className="home-root">

          <div className="home-background"></div>
          <div className="home-message">
            <p>在庫管理アプリ</p>
            <p>For　ハンドメイド</p>
          </div>
        <div className="home-google-signin">
          <Link to="login" title="Sign in with Google Account">
            <img src="image/google_signin_normal.png" width="180" alt="Sign in with Google"/>
          </Link>
          <p>ご利用にはGoogleアカウントでのログインが必要です。</p>
        </div>
      </div>
      )
    
  }
}


