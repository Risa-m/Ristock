import React from 'react'
import 'asset/components.css'
import PropTypes from 'prop-types';

import Button from '@material-ui/core/Button';
import AddPhotoAlternateIcon from "@material-ui/icons/AddPhotoAlternate";

export const ImageUploadView = (props) => {
  const { image_url, local_image_src } = props

  const UploadedImage = () => {
    if(image_url && !local_image_src){
      return <img src={image_url} className="stock-form-image-show"/>
    }
    else if(local_image_src) {
      return <img src={local_image_src} className="stock-form-image-show"/>
    }
    else {
      return null
    }
  }

  return (
    <>
    <input
        accept="image/*"
        id="contained-button-file"
        type="file"
        className="image-input"
        onChange={e => props.imageChangeHandler(e)}
      />
      <label htmlFor="contained-button-file">
        <Button variant="contained" color="primary" component="span">
          Upload
          <AddPhotoAlternateIcon />
        </Button>
      </label>
      {UploadedImage()}
    </>
  )
}

ImageUploadView.propTypes = {
  image_url: PropTypes.string,
  local_image_src: PropTypes.string,
  imageChangeHandler: PropTypes.func,
}

