import React from 'react';
//import logo from './logo.svg';
import { BrowserRouter, Route, Link, Switch, Redirect } from 'react-router-dom'
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
import { StockDetail } from './view/StockDetail';

import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';

import HomeIcon from '@material-ui/icons/Home';
import AddIcon from '@material-ui/icons/Add';
import ListIcon from '@material-ui/icons/List';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import InputIcon from '@material-ui/icons/Input';


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
      <div className="switch-view">
        <div className="App-title">
          <Link to="/"><h1>Ristock</h1></Link>
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
            {//<InputIcon fontSize="small" className="home-login-icon" />
            }
          </Link>
        }
        </div>

      <Switch>
        <Route exact path='/' render={props =><Home user={this.state.user} userID={this.state.userID}  {...props}/>} />

        <Auth setUser={this.setUser} setUserID={this.setUserID}  {...this.props}>
          <Switch>
            <Route exact path='/login' render={props => <Login user={this.state.user} userID={this.state.userID} {...props}/>} />
            <Route exact path='/stocks' render={props => <StockList user={this.state.user} userID={this.state.userID} {...props}/>} />
            <Route exact path='/stocks/add' render={props => <AddStock user={this.state.user} userID={this.state.userID} {...props}/>} />
            <Route exact path='/stocks/:id' render={props => <StockDetail user={this.state.user} userID={this.state.userID} match={props.match} {...props}/>} />
            <Route render={() => <p>not found.</p>}/>
          </Switch>
        </Auth>
      </Switch>
      </div>

      {/*(this.state.user)? 
      <BottomNavigation showLabels value={this.state.buttomNav} onChange={this.handleButtomNavChange} className="bottom-nav" >
        <BottomNavigationAction label="Home" value="/" icon={<HomeIcon />} to="/" component={Link} />
        <BottomNavigationAction label="Add" value="/stocks/add" icon={<AddIcon />} to="/stocks/add" component={Link} />
        <BottomNavigationAction label="List" value="/stocks" icon={<ListIcon />} to="/stocks" component={Link} />
        {
          <BottomNavigationAction label="Logout" value="logout" color="secondary" icon={<ExitToAppIcon />} onClick={this.logout.bind(this)} to="/" component={Link}/>
        }
      </BottomNavigation>
      :
      /*
      <BottomNavigation showLabels value={this.state.buttomNav} onChange={this.handleButtomNavChange} className="bottom-nav" >
        <BottomNavigationAction label="Home" value="/" icon={<HomeIcon />} to="/" component={Link} />
        <BottomNavigationAction label="Login" value="/login" icon={<InputIcon />} to="/login" component={Link} />
      </BottomNavigation>
      */
       null
      }
    </div>
    </BrowserRouter>
    );
  }
}

export default App;
