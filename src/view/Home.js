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
        <div>
          <h3>HOME</h3>
          <p>在庫を管理すとっく！</p>
          <Link to="stocks">stocks list</Link>
        </div>
      )
    }else{

    return (
      <div className="home-root">
        <h3>HOME</h3>
        <p>在庫を管理するためのWebアプリケーションです。</p>
        <p>利用するにはGoogleアカウントでのログインが必要です。</p>
      </div>
      )
    }
  }
}


