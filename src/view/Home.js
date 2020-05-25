import React from 'react'
import { Link } from "react-router-dom";
import firebase, { db } from '../firebase';
import Button from '@material-ui/core/Button';
import './views.css';


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
          <img src="image/google_signin_normal.png" width="180" alt="Sign in with Google" onmouseover="this.src='image/google_signin_focus.png'" onmouseout="this.src='image/google_signin_normal.png'"/>
          <p>ご利用にはGoogleアカウントでのログインが必要です。</p>
        </div>
      </div>
      )
    }
  }
}


