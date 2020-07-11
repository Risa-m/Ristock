import React, { useState } from 'react'
import 'asset/components.css'
import PropTypes from 'prop-types';

import SettingViewChoice from 'components/Settings/SettingViewChoice'

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import Divider from '@material-ui/core/Divider';

import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import CheckIcon from '@material-ui/icons/Check';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import AddIcon from '@material-ui/icons/Add';

const MAX_TEXT_INPUT_LENGTH = 20

export const SettingOfCategoryView = (props) => {
  const { userID, category_map } = props
  const [ newCategoryName, setNewCategoryName ] = useState("")
  const [ isCreate, setCanCreate ] = useState(false)
  const [ createError, setCreateError ] = useState(false)

  const createNewCategory = () => {
    let search = Object.keys(category_map).filter(val => category_map[val] === newCategoryName)
    if(search.length === 0){
      setCreateError(false)
      props.handleCategoryCreate(userID, newCategoryName, category_map)
      setCanCreate(false)
      setNewCategoryName("")
    }
    else{
      setCreateError(true)
    }
  }

  const showCreateCategoryField = () => {
    setCanCreate(true)
    setCreateError(false)
  }

  const handleCategoryNameChange = (event) => {
    setNewCategoryName(event.target.value)
  }

  const showErrorMessage = (isError) => {
    if(isError){
      return <span className="category-setting-error-message">既に登録されています。</span>
    }
    else{
      return null
    }
  }

  const newCategoryField = (isCreate) => {
    if(isCreate){
      return (
        <div>
          <TextField 
            id="standard-basic" 
            value={newCategoryName}
            InputProps={{ inputProps: { maxLength: MAX_TEXT_INPUT_LENGTH} }} 
            onChange={(event) => handleCategoryNameChange(event)}/>
          <IconButton aria-label="ok"  
            onClick={() => createNewCategory()} 
            style={{padding: "6px", verticalAlign: "middle"}}>
            <CheckIcon fontSize="small"/>
          </IconButton>
          {showErrorMessage(createError)}
        </div>
      )  
    }
    else {
      return null
    }

  }

  return (
    <div className="setting-category-chips">
      <div onClick={() => props.viewChange(SettingViewChoice.top)}>
        <ArrowBackIcon fontSize="small" style={{verticalAlign: "bottom"}}/> Back
      </div>
      
      <List aria-label="categories">
      <ListItem >
        <ListItemText primary="Category Setting" />
        <ListItemIcon >
          <IconButton aria-label="add" 
            style={{padding: "6px", verticalAlign: "middle"}} 
            onClick={() => showCreateCategoryField()}>
            <AddIcon fontSize="small"/>
          </IconButton>
        </ListItemIcon>
      </ListItem>
      <Divider />

      <ListItem >
      {newCategoryField(isCreate)}
      </ListItem >
        {Object.keys(category_map).map((val, idx) => (
          <EditableCategoryItemView 
            userID={userID} 
            categoryID={val} 
            category_map={category_map}
            handleCategoryDelete={props.handleCategoryDelete}
            handleCategoryRename={props.handleCategoryRename}
            key={val}
            />
        ))}
      </List>

    </div>
    )
}
SettingOfCategoryView.propTypes = {
  userID: PropTypes.string,
  category_map: PropTypes.object,
  viewChange: PropTypes.func,
  handleCategoryDelete: PropTypes.func,
  handleCategoryRename: PropTypes.func,
  handleCategoryCreate: PropTypes.func,
}


const EditableCategoryItemView = (props) => {
  const { userID, categoryID, category_map } = props
  const [ isEdit, setCanEdit ] = useState(false)
  const [ categoryName, setCategoryName ] = useState(category_map[categoryID])
  const [ isSettingIconsShow, setsettingIconsShow ] = useState(false)

  const handleCategoryNameChange = (event) => {
    setCategoryName(event.target.value)
  }

  const categoryNameChanged = () => {
    // 他のカテゴリ名と被ってないかチェック（元々の名前を除く）
    let search = Object.keys(category_map).filter(val => (val !== categoryID && category_map[val] === categoryName))
    if(search.length === 0){
      props.handleCategoryRename(userID, categoryID, categoryName, category_map)
      setCanEdit(false)
    }
  }

  const ItemView = (isEdit) => {
    if(isEdit){
      return (        
        <>
          <TextField 
            id="standard-basic" 
            value={categoryName}
            InputProps={{ inputProps: { maxLength: MAX_TEXT_INPUT_LENGTH} }} 
            onChange={(event) => handleCategoryNameChange(event)}/>
          <IconButton aria-label="ok"  
            onClick={() => categoryNameChanged()} 
            style={{padding: "6px", verticalAlign: "middle"}}>
            <CheckIcon fontSize="small"/>
          </IconButton>
        </>
      )
    }else{
      return <ListItemText primary={categoryName} />
    }  
  }

  const itemSettingShow = (isEdit, categoryID) => {
    if(isSettingIconsShow && !isEdit){
      return (
        <>
        <ListItemIcon>
          <IconButton aria-label="edit" 
            onClick={() => setCanEdit(true)} 
            style={{padding: "6px", verticalAlign: "middle"}}>
            <EditIcon fontSize="small"/>
          </IconButton>
        </ListItemIcon>
        <ListItemIcon>
          <IconButton aria-label="delete" 
            onClick={() => props.handleCategoryDelete(userID, categoryID, category_map)} 
            style={{padding: "6px", verticalAlign: "middle"}}>
            <DeleteIcon fontSize="small"/>
          </IconButton>
        </ListItemIcon>
      </>
      )  
    }
    else{
      return null
    }
  }

  return (
    <ListItem 
      onMouseEnter={() => setsettingIconsShow(true)} 
      onTouchStart={() => setsettingIconsShow(true)}
      onMouseLeave={() => setsettingIconsShow(false)}>
        {ItemView(isEdit)}
        {itemSettingShow(isEdit, categoryID)}
    </ListItem>
  )
}

EditableCategoryItemView.propTypes = {
  userID: PropTypes.string,
  categoryID: PropTypes.string, 
  category_map: PropTypes.object,
  handleCategoryDelete: PropTypes.func,
  handleCategoryRename: PropTypes.func,
}