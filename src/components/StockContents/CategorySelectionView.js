import React from 'react'
import 'components/components.css'
import PropTypes from 'prop-types';


import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';

import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import DoneIcon from '@material-ui/icons/Done';
import CloseIcon from '@material-ui/icons/Close';

const MAX_TEXT_INPUT_LENGTH = 20

export const CategorySelectionView = (props) => {
  const { isAddCategoryOpen, addCategoryText, category_map, category_id } = props

  if(isAddCategoryOpen){
    return (
      <>
      <div className="stock-form-category-add">
        <TextField 
          id="standard-basic" 
          className="stock-form-category-add-text" 
          value={addCategoryText} 
          label="Add Category" 
          InputProps={{ inputProps: { maxLength: MAX_TEXT_INPUT_LENGTH} }} 
          onChange={(event) => props.handleValueChanege("addCategoryText", event)}/>
        <IconButton 
          aria-label="add-category" 
          className="stock-form-category-add-button" 
          onClick={() => props.addCategoryHandler()}>
          <DoneIcon fontSize="small" />
        </IconButton>
        <IconButton 
          aria-label="add-category" 
          className="stock-form-category-add-button" 
          onClick={() => props.addCategoryClose()}>
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
        onClick={() => props.addCategoryOpen()}>
        <AddIcon fontSize="small" />
      </IconButton>
      </>
    )
  }
}


CategorySelectionView.propTypes = {
  isAddCategoryOpen: PropTypes.bool,
  addCategoryText: PropTypes.string,
  addCategoryHandler: PropTypes.func,
  addCategoryOpen: PropTypes.func,
  addCategoryClose: PropTypes.func,
  handleCategoryChanege: PropTypes.func,
  category_map: PropTypes.object,
  category_id: PropTypes.string,
  handleValueChanege: PropTypes.func,
}

