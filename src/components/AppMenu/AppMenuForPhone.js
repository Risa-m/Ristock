import React, { useState } from 'react';
import { Link} from 'react-router-dom'
import 'asset/App.css';
import PropTypes from 'prop-types';

import SvgIcon from '@material-ui/core/SvgIcon';
import Drawer from '@material-ui/core/Drawer';

import MenuIcon from '@material-ui/icons/Menu';
import SettingsIcon from '@material-ui/icons/Settings';
import HomeIcon from '@material-ui/icons/Home';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';

export const AppMenuForPhone = (props) => {
  const { userID, user } = props
  const [ modalOpen, setModalOpen ] = useState(false)

  const showUserEMail = (user) => {
    if(user.email){
      return <p style={{fontSize: "0.7em", paddingLeft: "10px"}}>{user.email}でログイン済みです。</p>
    }
    else {
      return null
    }
  }

  const toggleDrawer = (open) => (event) => {
      if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
        return;
      }
      setModalOpen(open)
    }

  const DrawerMenu = () => {
    if(userID){
      return (
        <div className="App-menu-list">
          <div className="App-menu-list-item">
            <Link to="/stocks" >
              <HomeIcon style={{verticalAlign: "middle"}}/> My page
              {showUserEMail(user)}
            </Link>
          </div>

          <div className="App-menu-list-item" onClick={props.settingChangeModalOpen}>
            <SettingsIcon style={{verticalAlign: "middle"}}/> Setting 
          </div>

          <div className="App-menu-list-item">
            <Link to="/" onClick={props.logout}>
              <ExitToAppIcon style={{verticalAlign: "middle"}}/> Logout&nbsp;
            </Link>
          </div>
        </div>
      )
    }else{
      return (
        <div className="App-menu-list">
          <div className="App-menu-list-item">
          <Link to={(props.user)?"/stocks":"/signup"} title="loginページへ移動">
            <SvgIcon style={{verticalAlign: "middle"}}>
              <svg><path d="M11,7L9.6,8.4l2.6,2.6H2v2h10.2l-2.6,2.6L11,17l5-5L11,7z M20,19h-8v2h8c1.1,0,2-0.9,2-2V5c0-1.1-0.9-2-2-2h-8v2h8V19z"/></svg>
            </SvgIcon>
            &nbsp;
            Login
          </Link>
          </div>
        </div>
      )
    }
  }

  return (
    <>
    <div className="App-phone-menu" onClick={toggleDrawer(true)}>
      <MenuIcon /*fontSize="large"*//>
    </div>
    <Drawer anchor="left" open={modalOpen} onClose={toggleDrawer(false)}>
      {DrawerMenu()}
    </Drawer>
    </>
    )
}

AppMenuForPhone.propTypes = {
  userID: PropTypes.string,
  user: PropTypes.object,
  settingChangeModalOpen: PropTypes.func,
  logout: PropTypes.func,  
}
