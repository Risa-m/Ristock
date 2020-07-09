import React from 'react'
import 'asset/components.css'
import PropTypes from 'prop-types';

import Chip from '@material-ui/core/Chip';

export const SettingOfCategoryView = (props) => {
  const { userID, category_map } = props
  return (
    <div className="setting-category-chips">
      {Object.keys(category_map).map((val, idx) => (
      (val)?
      <Chip 
        label={category_map[val]} 
        variant="default"
        key={idx} 
        color="primary" 
        onDelete={() => props.handleCategoryDelete(userID, val)}/>
      :null
      ))}
    {//<Chip icon={<AddIcon/>} label="Add" onClick={this.addCategoryHandler.bind(this)} style={{maxWidth: "100%", padding: "0"}}/>
    }
  </div>
  )
}
SettingOfCategoryView.propTypes = {
  userID: PropTypes.string,
  category_map: PropTypes.object,
  handleCategoryDelete: PropTypes.func,
}

