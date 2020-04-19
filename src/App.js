import React from 'react';
//import logo from './logo.svg';
import { BrowserRouter, Route, Link, Switch } from 'react-router-dom'
import './App.css';

//const Home = lazy(() => import('./Home'));
import { Home } from './view/Home.js'
import { AddStock } from './view/AddStock.js'
import { StockList } from './view/StockListView.js'


function App() {
  return (
    <BrowserRouter>
    <div className="App-root">
      <div className="switch-view">
      <ul>
      <li><Link to='/'>Home</Link></li>
      <li><Link to='/add'>Add Stocks</Link></li>
      <li><Link to='/list'>List</Link></li>
      </ul>

      <Switch>
        <Route exact path='/' component={Home} />
        <Route exact path='/add' component={AddStock} />
        <Route exact path='/list' component={StockList} />
        {//<Route exact path='/works/:id' render={props => <WorksItem match={props.match} />} />
        }
      </Switch>
      </div>
    </div>
    </BrowserRouter>
  );
}

export default App;
