import React from 'react';
//import logo from './logo.svg';
import { BrowserRouter, Route, Link, Switch } from 'react-router-dom'
import './App.css';

import firebase from './firebase';
import Button from '@material-ui/core/Button';

//const Home = lazy(() => import('./Home'));
import { Home } from './view/Home.js'
import { Stocks } from './view/Stocks.js'
import { StockList } from './view/StockList.js'
import { AddStock } from './view/AddStock';
import Auth from './components/Auth.js'
import { Login } from './components/Login.js'

class App extends React.Component {
  constructor(){
    super()

    this.state = {
      isSigned: false,
      user: null,
      userID: null
    }

    this.isSigned = this.isSigned.bind(this)
    this.setUser = this.setUser.bind(this)
    this.setUserID = this.setUserID.bind(this)
  }

  isSigned(isSigned) {
    //console.log("callback isSigned", isSigned)
    this.setState({isSigned : isSigned})
  }

  setUser(user){
    //console.log("callback user", user)
    this.setState({user : user})
  }

  setUserID(userID){
    //console.log("callback userID", userID)
    this.setState({userID: userID})
  }

  logout(){
    firebase.auth().signOut()
    this.setState({isSigned: false, user: null, userID: null})
  }


  render(){
    return (
    <BrowserRouter>
    <div className="App-root">
      <div className="switch-view">
      <Link to="/"><h1>Ristock</h1></Link>
      {/*}
      <ul>
      <li><Link to='/'>Home</Link></li>
      <li><Link to='/stocks/add'>Add Stocks</Link></li>
      <li><Link to='/stocks'>List</Link></li>
      {(this.state.isSigned)? <li><Button onClick={this.logout}>logout</Button></li> : null
      }
      </ul>
      */}
      <Switch>
        <Route exact path='/' render={props =><Home user={this.state.user} userID={this.state.userID}/>} />

        <Auth setUser={this.setUser} setUserID={this.setUserID} isSigned={this.isSigned} {...this.props}>
          <Switch>
            <Route exact path='/login' render={props => <Login user={this.state.user} userID={this.state.userID}/>} />
            <Route exact path='/stocks' render={props => <StockList user={this.state.user} userID={this.state.userID}/>} />
            <Route exact path='/stocks/add' render={props => <AddStock user={this.state.user} userID={this.state.userID}/>} />
            <Route render={() => <p>not found.</p>}/>
          </Switch>
        </Auth>
      </Switch>
      </div>
    </div>
    </BrowserRouter>
    );
  }
}

export default App;
