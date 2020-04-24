import React from 'react';
//import logo from './logo.svg';
import { BrowserRouter, Route, Link, Switch } from 'react-router-dom'
import './App.css';

//const Home = lazy(() => import('./Home'));
import { Home } from './view/Home.js'
import { Stocks } from './view/Stocks.js'


function App() {
  return (
    <BrowserRouter>
    <div className="App-root">
      <div className="switch-view">
      <ul>
      <li><Link to='/'>Home</Link></li>
      <li><Link to='/stocks/add'>Add Stocks</Link></li>
      <li><Link to='/stocks'>List</Link></li>
      </ul>

      <Switch>
        <Route exact path='/' component={Home} />
        <Route exact path='/stocks' component={Stocks} />
        <Route exact path='/stocks/:id' render={props => <Stocks match={props.match} />} />

        {//<Route exact path='/stocks/add' component={AddStock} />
        //<Route exact path='/stocks/list' component={StockList} />
        }

        {//<Route exact path='/works/:id' render={props => <WorksItem match={props.match} />} />
        }

      </Switch>
      </div>
    </div>
    </BrowserRouter>
  );
}

export default App;
