import React from 'react'
import 'asset/components.css'
import PropTypes from 'prop-types';

import TextField from '@material-ui/core/TextField';

const MAX_TEXT_INPUT_LENGTH = 20

export const StockContentTextField = (props) => {
  const { obj } = props

  if(obj.type === "string"){
    return (
      <TextField 
        id="standard-basic" 
        className="stock-form-text" 
        value={props[obj.value]} 
        InputProps={{ inputProps: { maxLength: MAX_TEXT_INPUT_LENGTH } }} 
        label={obj.label}
        onChange={(event) => props.handleValueChanege(obj.value, event)}/> 
    )  
  }
  else if(obj.type === "number"){
    return (
        <TextField 
          id="standard-number" 
          className="stock-form-text" 
          type="number" 
          value={props[obj.value]} 
          InputProps={{ inputProps: { min: 0} }} 
          label={obj.label} 
          onChange={(event) => props.handleValueChanege(obj.value, event)} 
          InputLabelProps={{shrink: true,}}/> 
    )  
  }
  else {
    return null
  }
}
StockContentTextField.propTypes = {
  handleValueChanege: PropTypes.func,
  obj: PropTypes.object,
}

