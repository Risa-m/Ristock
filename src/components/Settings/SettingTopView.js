import React from 'react'
import 'asset/components.css'
import PropTypes from 'prop-types';

import SettingViewChoice from 'components/Settings/SettingViewChoice'

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import CategoryIcon from '@material-ui/icons/Category';

export const SettingTopView = (props) => {
  return (
    <>
    <List component="nav" aria-label="">
      <ListItem button onClick={() => props.viewChange(SettingViewChoice.category)}>
        <ListItemIcon>
          <CategoryIcon />
        </ListItemIcon>
        <ListItemText primary="Category Setting" />
      </ListItem>
    </List>
  </>
  )
}
SettingTopView.propTypes = {
  viewChange: PropTypes.func,
}

