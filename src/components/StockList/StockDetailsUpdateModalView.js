import React from 'react'
import 'asset/views.css';
import PropTypes from 'prop-types';

import { StockContents } from 'components/StockContents/StockContents'
import ModalWrapper from 'components/ModalWrapper'

export const StockDetailsUpdateModalView = (props) => {
  const { userID, detailsItemID, wantToAddItem, modalOpen, category_list, category_map } = props

  if((detailsItemID) || (wantToAddItem && props.canUserAddDocs())){
    return (
      <div className="stock-list-details-modal">
        <ModalWrapper
          open={modalOpen}
          handleClose={props.handleClose}
          content={
            <StockContents 
              item_id={detailsItemID} 
              userID={userID} 
              category_list={category_list} 
              category_map={category_map} 
              handleClose={props.handleSubmitClose}
              handleSubmitClose={props.handleSubmitClose}
              categoryChanged={props.categoryChanged}
              createCategory={props.createCategory}
            />}
        />
      </div>
    )
  }
  else{
    return null
  }
}

StockDetailsUpdateModalView.propTypes = {
  userID: PropTypes.string,
  detailsItemID: PropTypes.string,
  wantToAddItem: PropTypes.bool,
  modalopen: PropTypes.bool,
  category_list: PropTypes.array,
  category_map: PropTypes.object,
  canUserAddDocs: PropTypes.func,
  handleClose: PropTypes.func,
  handleSubmitClose: PropTypes.func,
  categoryChanged: PropTypes.func,
}

