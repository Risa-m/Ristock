import React from 'react';
import { Link } from 'react-router-dom'
import 'asset/App.css';
import PropTypes from 'prop-types';

import SettingsIcon from '@material-ui/icons/Settings';

export const AppMenuForPC = (props) => {
  const { userID } = props

  const MenuList = () => {
    if(userID){
      return(
        <div className="App-menu-side">
          <div className="App-menu-side-item">
            <SettingsIcon onClick={props.settingChangeModalOpen}/>
          </div>
          <div className="App-menu-side-item">
            <Link to="/stocks" >My page</Link>
          </div>
          <div className="App-menu-side-item">
            <Link to="/" onClick={props.logout}>Logout</Link>
          </div>
        </div>
      )
    }else{
      return (
        <div className="App-menu-side">
          <div className="App-menu-side-item">
            <Link to={(props.user)?"/stocks":"/signup"} title="loginページへ移動">
              Login
            </Link>
          </div>
        </div>
      )  
    }
  }

  return (
    <div className="App-pc-menu">
      {MenuList()}
    </div>
  )
}

AppMenuForPC.propTypes = {
  userID: PropTypes.string,
  settingChangeModalOpen: PropTypes.func,
  logout: PropTypes.func,   
}

