import React, { useState } from 'react'
import 'asset/components.css'
import PropTypes from 'prop-types';

import Paper from '@material-ui/core/Paper';

import cellNameToLabels from 'components/cellNameToLabels';
import { ImageUploadView } from 'components/StockContents/ImageUploadView';
import { CategorySelectionView } from 'components/StockContents/CategorySelectionView';
import { StockContentTextField } from 'components/StockContents/StockContentTextField';

import Grid from '@material-ui/core/Grid';

export const StockContentGridView = (props) => {
  const { category_map, category_id, image_url, local_image_src } = props

  const [ zoomView, setZoomView ] = useState(false)
  const [ mouseX, setMouseX ] = useState(-300)
  const [ mouseY, setMouseY ] = useState(-300)
  
  const handleMouseMove = (event) => {
    if(zoomView){
      const bounds = event.target.getBoundingClientRect()
      setMouseX(event.clientX - bounds.left + bounds.width)
      setMouseY(event.clientY - bounds.top + bounds.height)
    }
  }

  const handleTouchMove = (event) => {
    if(zoomView){
      for (let i = 0; i < event.changedTouches.length; ++i) {
        const touch = event.changedTouches[i]
        const bounds = touch.target.getBoundingClientRect()
        setMouseX(touch.clientX - (bounds.left/2))
        setMouseY(touch.clientY - (bounds.top/2))
      }
    }
  }

  const showZoomView = (isVisible) => {
    setZoomView(isVisible)
  }

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
            handleNewCategoryNameChange={props.handleNewCategoryNameChange}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <ImageUploadView 
            image_url={image_url}
            local_image_src={local_image_src}
            imageChangeHandler={props.imageChangeHandler}
            showZoomView={showZoomView}
            handleMouseMove={handleMouseMove}
            handleTouchMove={handleTouchMove}
          />
        </Grid>

        <ImageView 
          image_url={image_url}
          local_image_src={local_image_src}
          isVisible={zoomView}
          mouseX={mouseX}
          mouseY={mouseY}
        />

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
  handleCategoryChange: PropTypes.func,
}


const ImageView = (props) => {
  const { image_url, local_image_src, isVisible, mouseX, mouseY } = props

  const uploadedImage = () => {
    if(image_url && !local_image_src){
      return <img src={image_url} className="zoom-image-view"/>
    }
    else if(local_image_src) {
      return <img src={local_image_src} className="zoom-image-view"/>
    }
    else {
      return null
    }
  }

  if(isVisible){
    return (
      <Paper variant="outlined" style={{padding: "0px", position: "absolute", left: mouseX, top: mouseY, zIndex: "10"}}>
        {uploadedImage()}
    </Paper>  
    )
  }
  else{
    return null
  }
}