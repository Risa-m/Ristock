import React from 'react'
import 'asset/views.css';
import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';

export const StockContentsImageShow = (props) => {
  const { visible, show_list } = props

  const imageView = (item) => {
    if(item[1].image_url){
      return <img src={item[1].image_url} width="100%" onClick={() => props.detailsDoc(item[0])} alt={item[1].name}/>
    }
    else{
      return <img src="image/no_image.png" width="100%" onClick={() => props.detailsDoc(item[0])} alt={item[1].name}/>
    }
  }
  
  if(visible){
    return(
    <div className="stock-list-image">
      <Grid container spacing={1}>
        {show_list.map(item => (
            <Grid item xs={6} sm={4} md={3} lg={2} xl={1} key={item[0]}>
              <div className="stock-list-image-item">
                <span className="square-content">
                {imageView(item)}
                </span>
              <p className="stock-list-image-name">{item[1].name}</p>
              <p>{item[1].modelNumber} {item[1].size} {item[1].color}</p>
              <p className="stock-list-image-stock">{item[1].stockNumber}</p>
              </div>
            </Grid>
        ))}
      </Grid>
    </div>
    )
  }
  else{
    return null
  }
}

StockContentsImageShow.propTypes = {
  visible: PropTypes.bool,
  show_list: PropTypes.array,
  detailsDoc: PropTypes.func,
}
