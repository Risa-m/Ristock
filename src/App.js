import React from 'react';
import { BrowserRouter, Route, Link, Switch } from 'react-router-dom'
import './App.css';

import firebase from './firebase';

import { Home } from './view/Home.js'
import { StockList } from './view/StockList'
import { signup, SignUp } from './view/SignUp';
import Auth from './components/Auth.js'
import { Login } from './components/Login.js'

import Drawer from '@material-ui/core/Drawer';
import MenuIcon from '@material-ui/icons/Menu';

class App extends React.Component {
  constructor(){
    super()

    this.state = {
      user: null,
      userID: null,
      buttomNav: "home",

      leftDrawerOpen: false,
    }

    this.setUser = this.setUser.bind(this)
    this.setUserID = this.setUserID.bind(this)
  }

  setUser(user){
    this.setState({user : user})
  }

  setUserID(userID){
    this.setState({userID: userID})
  }

  logout(){
    firebase.auth().signOut()
    this.setState({isSigned: false, user: null, userID: null})
  }

  handleButtomNavChange = (event, newValue) => {
    this.setState({buttomNav: newValue});
  };

  setBottomNav(url){
    this.setState({buttomNav: url})
  }

  toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    this.setState({leftDrawerOpen: open});
  };

  leftMenuList = () => {
    if(this.state.user){
      return (
        <div className="App-menu-list">
          <div className="App-menu-list-item">
            <Link to="/stocks" >
              My page
            {(this.state.user.email)?
            <p style={{fontSize: "0.7em", paddingLeft: "10px"}}>{this.state.user.email}でログイン済みです。</p>
            :null}
            </Link>
          </div>

          <div className="App-menu-list-item">
            <Link to="/" onClick={this.logout.bind(this)}>
              Logout&nbsp;
            </Link>
          </div>
        </div>
      )
    }else{
      return (
        <div className="App-menu-list">
          <div className="App-menu-list-item">
          <Link to="login" title="Sign in with Google Account">
            Login&nbsp;
            <br/>
            <p style={{fontSize: "0.7em", paddingLeft: "10px"}}>ご利用にはGoogleアカウントによる認証が必要です。</p>
          </Link>
          </div>
        </div>
      )

    }
  }

  rightMenuList = () => {
    if(this.state.user){
      return(
        <div className="App-menu-side">
          <div className="App-menu-side-item">
            <Link to="/stocks" >
              My page
              {/*(this.state.user.email)?
            <p style={{fontSize: "0.7em", paddingLeft: "10px"}}>{this.state.user.email}</p>
              :null*/}
            </Link>
          </div>

          <div className="App-menu-side-item">
            <Link to="/" onClick={this.logout.bind(this)}>
              Logout
            </Link>
          </div>
        </div>
      )
    }else{
      return (
        <div className="App-menu-side">
          <div className="App-menu-side-item">
            <Link to="login" title="Sign in with Google Account">
            Login
            <p style={{fontSize: "0.7em", paddingLeft: "10px"}}>with google</p>
            </Link>
          </div>
        </div>
      )
    }
  }


  render(){
    return (
    <BrowserRouter>
    <div className="App-root">
      <div className="App-header">

        <div className="App-phone-menu" onClick={this.toggleDrawer(true)}><MenuIcon /*fontSize="large"*//></div>
          <Drawer anchor="left" open={this.state.leftDrawerOpen} onClose={this.toggleDrawer(false)}>
            <this.leftMenuList/>
          </Drawer>

        <div className="App-title">
          <Link to="/">
            <h1>Ristock</h1>
            <img src="icon.png" alt="Ristock" className="App-title-logo"/>
          </Link>
        </div>
        <div className="App-pc-menu">
          <this.rightMenuList/>
          </div>
        </div>
      <div className="App-view">
        <Switch>
          <Route exact path='/' render={props =><Home user={this.state.user} userID={this.state.userID}  {...props}/>} />
          <Route exact path='/signup' render={props =><SignUp user={this.state.user} userID={this.state.userID}  {...props}/>} />
          <Auth setUser={this.setUser} setUserID={this.setUserID}  {...this.props}>
            <Switch>
              <Route exact path='/login' render={props => <Login user={this.state.user} userID={this.state.userID} {...props}/>} />
              <Route exact path='/stocks' render={props =><StockList user={this.state.user} userID={this.state.userID}  {...props}/>} />
              <Route render={() => <p>Sorry, page not found.</p>}/>
            </Switch>
          </Auth>
        </Switch>
      </div>
      <div className="App-footer">
        <p className="copyright"><a href="https://github.com/Risa-m">&copy; 2020 Risa-m</a></p>
        <p className="version" style={{fontSize: "0.6em", textAlign: "center"}}>version: 0.0.3</p>   
      </div>
    </div>
    </BrowserRouter>
    );
  }
}

export default App;
