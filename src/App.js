import React from 'react';
import { BrowserRouter, Route, Link, Switch } from 'react-router-dom'
import './App.css';

import firebase from './firebase';

import { Home } from './view/Home.js'
import { StockList } from './view/StockList'
import Auth from './components/Auth.js'
import { Login } from './components/Login.js'


class App extends React.Component {
  constructor(){
    super()

    this.state = {
      user: null,
      userID: null,
      buttomNav: "home"
    }

    this.setUser = this.setUser.bind(this)
    this.setUserID = this.setUserID.bind(this)
  }

  setUser(user){
    //console.log("[App]callback user", user)
    this.setState({user : user})
  }

  setUserID(userID){
    //console.log("[App]callback userID", userID)
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



  render(){
    return (
    <BrowserRouter>
    <div className="App-root">
      <div className="App-header">
        <div className="App-title">
          <Link to="/">
            <h1>Ristock</h1>
            <img src="logo512.png" className="App-title-logo" width="60"/>
          </Link>
        </div>
        <div className="App-login">
          {(this.state.user)?
          <Link to="/" onClick={this.logout.bind(this)}>
            Logout&nbsp;
          </Link>
          :
          <Link to="login" title="Sign in with Google Account">
            Login&nbsp;
            <p>with google</p>
          </Link>
           }
          </div>
        </div>
      <div className="switch-view">
        <Switch>
          <Route exact path='/' render={props =><Home user={this.state.user} userID={this.state.userID}  {...props}/>} />
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
        <p className="copyright">&copy; 2020 Risa-m</p>      
      </div>
    </div>
    </BrowserRouter>
    );
  }
}

export default App;
