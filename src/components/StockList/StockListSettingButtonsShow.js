import React from 'react'
import 'asset/views.css';
import PropTypes from 'prop-types';

import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import ImageIcon from '@material-ui/icons/Image';
import ListIcon from '@material-ui/icons/List';

import VisibleViewString from 'components/StockList/VisibleViewString'

export const StockListSettingButtonsShow = (props) => {
  const { current_view } = props

  const listViewButton = (current_view) => {
    if(current_view === VisibleViewString.image){
      return <ListIcon />
    }
    else if(current_view === VisibleViewString.list){
      return <ImageIcon />
    }
    else {
      return null
    }
  }

  return(
    <div className="stock-list-buttons">
      <IconButton className="stock-list-view-button" aria-label="view change" onClick={() => props.settingColumn()}>
        {listViewButton(current_view)}
      </IconButton>

      <IconButton className="stock-list-add-button" aria-label="add" onClick={() => props.addDoc()}>
        <AddIcon />
      </IconButton>
    </div>
  )
}

StockListSettingButtonsShow.protoTypes = {
  current_view: PropTypes.bool,
  settingColumn: PropTypes.func,
  addDoc: PropTypes.func
}