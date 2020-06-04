import React from 'react'
import { Link } from "react-router-dom";
import './views.css';
import { StockList } from './StockList.js'

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
        {/*
        <p>在庫を管理するためのWebアプリケーションです。</p>
        <p>ハンドメイド資材等の在庫管理にお使い下さい(*'▽')</p>
        */}
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


