import React from 'react'
import { Link } from "react-router-dom";
import firebase, { db } from '../firebase';
import Button from '@material-ui/core/Button';
import './views.css';

import InputIcon from '@material-ui/icons/Input';
import IconButton from '@material-ui/core/IconButton';

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
        <div className="home-root">  
          <div className="home-background"></div>
        </div>
      )
    }else{

    return (
      <div className="home-root">
        <div className="home-login">
          <Link to="login" >
            Login&nbsp;
            <InputIcon fontSize="small" className="home-login-icon" />
          </Link>
        </div>

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
          <img src="image/google_signin_normal.png" width="180" alt="Sign in with Google"/>
          <p>ご利用にはGoogleアカウントでのログインが必要です。</p>
        </div>
      </div>
      )
    }
  }
}


