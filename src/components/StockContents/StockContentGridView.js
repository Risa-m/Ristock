import React from 'react'
import 'asset/components.css'
import PropTypes from 'prop-types';

import cellNameToLabels from 'components/cellNameToLabels';
import { ImageUploadView } from 'components/StockContents/ImageUploadView';
import { CategorySelectionView } from 'components/StockContents/CategorySelectionView';
import { StockContentTextField } from 'components/StockContents/StockContentTextField';

import Grid from '@material-ui/core/Grid';

export const StockContentGridView = (props) => {
  const { category_map, category_id, image_url, local_image_src } = props

  return (
    <form className="stock-form" noValidate autoComplete="off">
      <Grid container spacing={3}>
        
        {cellNameToLabels
          .filter(obj => obj.value !== "category")
          .map((obj, idx) => (
            <Grid item xs={12} sm={6} key={idx}>
              <StockContentTextField obj={obj} {...props} />
            </Grid>
          )
        )}

        <Grid item xs={12} sm={6}>
          <CategorySelectionView 
            createNewCategory={props.createNewCategory}
            handleCategoryChanege={props.handleCategoryChanege}
            category_map={category_map}
            category_id={category_id}
            handleValueChanege={props.handleValueChanege}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <ImageUploadView 
            image_url={image_url}
            local_image_src={local_image_src}
            imageChangeHandler={props.imageChangeHandler}/>
        </Grid>

      </Grid>
    </form>
  )
}

StockContentGridView.propTypes = {
  createNewCategory: PropTypes.func,
  category_map: PropTypes.object,
  category_id: PropTypes.string,
  image_url: PropTypes.string,
  local_image_src: PropTypes.string,
  imageChangeHandler: PropTypes.func,
  handleValueChanege: PropTypes.func,
}

