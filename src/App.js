import React from 'react';
//import logo from './logo.svg';
import { BrowserRouter, Route, Link, Switch } from 'react-router-dom'
import './App.css';

//const Home = lazy(() => import('./Home'));
import { Home } from './view/Home.js'
import { Stocks } from './view/Stocks.js'
import { StockList } from './view/StockList.js'

import firebase from './firebase';
import Button from '@material-ui/core/Button';

import Auth from './components/Auth.js'
import { AddStock } from './view/AddStock';

class App extends React.Component {
  constructor(){
    super()

    this.state = {
      isSigned: false,
      user: null
    }

    this.isSigned = this.isSigned.bind(this)
    this.setUser = this.setUser.bind(this)
  }

  isSigned(isSigned) {
    console.log("callback isSigned", isSigned)
    this.setState({isSigned : isSigned})
  }

  setUser(user){
    console.log("callback user", user)
    this.setState({user : user})
  }

  logout(){
    firebase.auth().signOut()
    this.setState({isSigned: false, user: null})
  }


  render(){
    return (
    <BrowserRouter>
    <div className="App-root">
      <div className="switch-view">
      <ul>
      <li><Link to='/'>Home</Link></li>
      <li><Link to='/stocks/add'>Add Stocks</Link></li>
      <li><Link to='/stocks'>List</Link></li>
      {//(this.state.isSigned)? <li><Button onClick={this.logout}>logout</Button></li> : null
      }
      </ul>

      <Switch>
        <Route exact path='/' component={Home}/>
    
        <Auth setUser={this.setUser} isSigned={this.isSigned}>
          <Switch>
            <Route exact path='/stocks' render={props => <StockList user={this.state.user} />} />
            <Route exact path='/stocks/add' render={props => <AddStock /*match={props.match}*/ user={this.state.user}/>} />
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
