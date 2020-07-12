import React, { useState } from 'react'
import 'asset/components.css'
import PropTypes from 'prop-types';


import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';

import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import DoneIcon from '@material-ui/icons/Done';
import CloseIcon from '@material-ui/icons/Close';

const MAX_TEXT_INPUT_LENGTH = 20

export const CategorySelectionView = (props) => {
  const { category_map, category_id } = props
  const [ createCategoryOpen, setCreateCategoryOpen ] = useState(false)
  const [ categoryName, setCategoryName] = useState("")

  const handleCreateNewCategory = async () => {
    await props.createNewCategory(categoryName)
    setCreateCategoryOpen(false)
    setCategoryName("")
  }

  const handleCategoryNameChange = (event) => {
    setCategoryName(event.target.value)
    props.handleNewCategoryNameChange(event.target.value)
  }

  const closeCreateView = () => {
    setCategoryName("")
    setCreateCategoryOpen(false)
  }

  if(createCategoryOpen){
    return (
      <>
      <div className="stock-form-category-add">
        <TextField 
          id="standard-basic" 
          className="stock-form-category-add-text" 
          value={categoryName} 
          label="新規カテゴリ" 
          InputProps={{ inputProps: { maxLength: MAX_TEXT_INPUT_LENGTH} }} 
          onChange={(event) => handleCategoryNameChange(event)}/>
        <IconButton 
          aria-label="add-category" 
          className="stock-form-category-add-button" 
          onClick={() => handleCreateNewCategory()}>
          <DoneIcon fontSize="small" />
        </IconButton>
        <IconButton 
          aria-label="add-category" 
          className="stock-form-category-add-button" 
          onClick={() => closeCreateView()}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </div>
      </>
    )
  }
  // カテゴリ選択
  else {
    return (
      <>
      <TextField
          id="standard-select"
          className="stock-form-category-select"
          select
          label="カテゴリー"
          value={category_id}
          onChange={event => props.handleCategoryChanege(event)}
      >
        {Object.keys(category_map).map((category_id, idx) => (
          <MenuItem key={idx} value={category_id /* event.target.value */}>
            {category_map[category_id]/* dropdownに表示する項目 */}
          </MenuItem>
        ))}
      </TextField>
      <IconButton 
        aria-label="add-category" 
        className="stock-form-category-select-button" 
        onClick={() => setCreateCategoryOpen(true)}>
        <AddIcon fontSize="small" />
      </IconButton>
      </>
    )
  }
}


CategorySelectionView.propTypes = {
  createNewCategory: PropTypes.func,
  handleCategoryChanege: PropTypes.func,
  category_map: PropTypes.object,
  category_id: PropTypes.string,
  handleValueChanege: PropTypes.func,
}

