import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import firebase from './firebase';

import {MuiThemeProvider} from '@material-ui/core/styles'
import {theme} from './components/themePalette'

ReactDOM.render(
  <MuiThemeProvider theme={theme}>
    <App />
    {/*
    <React.StrictMode>
      <App />
    </React.StrictMode>
    */}
  </MuiThemeProvider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
