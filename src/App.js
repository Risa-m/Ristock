import React from 'react';
import { BrowserRouter, Route, Link, Switch } from 'react-router-dom'
import 'asset/App.css';

import firebase from './firebase';

import { Home } from 'view/Home.js'
import { StockList } from 'view/StockList'
import { SignUp } from 'view/SignUp';
import Auth from 'components/Auth.js'
import { Login } from 'components/Login.js'

import { AppMenuForPhone } from 'components/AppMenu/AppMenuForPhone'
import { AppMenuForPC } from 'components/AppMenu/AppMenuForPC'
import { SettingModal } from 'components/AppMenu/SettingModal'

class App extends React.Component {
  constructor(){
    super()

    this.state = {
      user: null,
      userID: null,

      isSettingModalOpen: false,

      settingChanged: false,
      refresh: false,
    }

    this.stockListRef = React.createRef();
  }

  auth = {
    setUser: (user) => {
      this.setState({user : user})
    },
  
    setUserID: (userID) => {
      this.setState({userID: userID})
    },
  
    logout: () => {
      firebase.auth().signOut()
      this.setState({user: null, userID: null})
    }
  }

  handleSettingChanged = () => {
    this.setState({
      settingChanged: true
    })
  }

  modal = {
    settingModalOpen: () => {
      this.setState({
        isSettingModalOpen: true
      })
    },  
    settingModalClose: () => {
      this.setState({
        isSettingModalOpen: false
      })
      //this.stockListRefresh()
    }
  }


  stockListRefresh(){
    if(this.state.settingChanged){
      this.stockListRef.current.getDocs();
      this.setState({settingChanged: false})
    }
  }

  render(){
    return (
    <BrowserRouter>
    <div className="App-root">
      <div className="App-header">

        <AppMenuForPhone 
          userID={this.state.userID} 
          user={this.state.user} 
          settingChangeModalOpen={this.modal.settingModalOpen}
          logout={this.auth.logout}/>
        <div className="App-title">
          <Link to="/">
            <h1>Ristock</h1><span className="title-beta">β</span>
            <img src="icon.png" alt="Ristock" className="App-title-logo"/>
          </Link>
        </div>
        <AppMenuForPC 
          userID={this.state.userID} 
          settingChangeModalOpen={this.modal.settingModalOpen}
          logout={this.auth.logout}/>
      </div>
        <SettingModal 
          userID={this.state.userID} 
          modalOpen={this.state.isSettingModalOpen}
          settingChanged={this.handleSettingChanged}
          setModalClose={this.modal.settingModalClose}
          />
      <div className="App-view">
        <Switch>
          <Route exact path='/' render={props =><Home user={this.state.user} userID={this.state.userID}  {...props}/>} />
          <Route exact path='/signup' render={props =><SignUp user={this.state.user} userID={this.state.userID}  {...props}/>} />
          <Auth setUser={this.auth.setUser} setUserID={this.auth.setUserID}  {...this.props}>
            <Switch>
              <Route exact path='/login' render={props => <Login user={this.state.user} userID={this.state.userID} {...props}/>} />
              <Route exact path='/stocks' render={props =><StockList user={this.state.user} userID={this.state.userID} ref={this.stockListRef} {...props}/>} />
              <Route render={() => <p>Sorry, page not found.</p>}/>
            </Switch>
          </Auth>
        </Switch>
      </div>
      <div className="App-footer">
        <p className="copyright"><a href="https://github.com/Risa-m">&copy; 2020 Risa-m</a></p>
        <p className="version" style={{fontSize: "0.6em", textAlign: "center"}}>version: 0.1.3</p>   
      </div>
    </div>
    </BrowserRouter>
    );
  }
}

export default App;

