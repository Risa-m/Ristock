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
    //console.log("callback user", user)
    this.setState({user : user})
  }

  setUserID(userID){
    //console.log("callback userID", userID)
    this.setState({userID: userID})
  }

  logout(){
    console.log("logout")
    firebase.auth().signOut()
    this.setState({isSigned: false, user: null, userID: null})
  }

  handleButtomNavChange = (event, newValue) => {
    this.setState({buttomNav: newValue});
  };



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
      {//<Button onClick={this.logout.bind(this)}>logout</Button>
      }
      <Switch>
        <Route exact path='/' render={props =><Home user={this.state.user} userID={this.state.userID}/>} />

        <Auth setUser={this.setUser} setUserID={this.setUserID}  {...this.props}>
          <Switch>
            <Route exact path='/login' render={props => <Login user={this.state.user} userID={this.state.userID}/>} />
            <Route exact path='/stocks' render={props => <StockList user={this.state.user} userID={this.state.userID}/>} />
            <Route exact path='/stocks/add' render={props => <AddStock user={this.state.user} userID={this.state.userID}/>} />
            <Route render={() => <p>not found.</p>}/>
          </Switch>
        </Auth>
      </Switch>
      </div>

      {(this.state.user)? 
      <BottomNavigation showLabels value={this.state.buttomNav} onChange={this.handleButtomNavChange} className="bottom-nav" >
        <BottomNavigationAction label="Home" value="home" icon={<HomeIcon />} to="/" component={Link} />
        <BottomNavigationAction label="Add" value="add" icon={<AddIcon />} to="/stocks/add" component={Link} />
        <BottomNavigationAction label="List" value="list" icon={<ListIcon />} to="/stocks" component={Link} />
        {
          <BottomNavigationAction label="Logout" value="logout" icon={<ExitToAppIcon />} onClick={this.logout.bind(this)} to="/" component={Link}/>
        }
      </BottomNavigation>
      :
      <BottomNavigation showLabels value={this.state.buttomNav} onChange={this.handleButtomNavChange} className="bottom-nav" >
        <BottomNavigationAction label="Home" value="home" icon={<HomeIcon />} to="/" component={Link} />
        <BottomNavigationAction label="Login" value="login" icon={<InputIcon />} to="/login" component={Link} />
      </BottomNavigation>
      }
    </div>
    </BrowserRouter>
    );
  }
}

export default App;
