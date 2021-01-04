import React from 'react'
import 'asset/views.css';
import PropTypes from 'prop-types';

import { StockContents } from 'components/StockContents'
import ModalWrapper from 'components/ModalWrapper'

export const StockDetailsUpdateModalView = (props) => {
  const { userID, detailsItemID, wantToAddItem, modalOpen, category_map, canUserAddDocs } = props

  if((detailsItemID) || (wantToAddItem && canUserAddDocs)){
    return (
      <div className="stock-list-details-modal">
        <ModalWrapper
          open={modalOpen}
          handleClose={props.handleClose}
          content={
            <StockContents 
              item_id={detailsItemID} 
              userID={userID} 
              category_map={category_map} 
              handleClose={props.handleSubmitClose}
              categoryChanged={props.categoryChanged}
              setErrorCode={props.setErrorCode}
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
  category_map: PropTypes.object,
  canUserAddDocs: PropTypes.bool,
  handleClose: PropTypes.func,
  handleSubmitClose: PropTypes.func,
  categoryChanged: PropTypes.func,
}

