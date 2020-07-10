import React, { useState, useEffect } from 'react';
import 'asset/App.css';
import PropTypes from 'prop-types';

import ModalWrapper from 'components/ModalWrapper'
import { SettingContents } from 'components/SettingContents'

export const SettingModal = (props) => {
  const { userID, modalOpen } = props
  const [ isModalOpen, setModalOpen ] = useState(modalOpen)

  const handleModalClose = () => {
    setModalOpen(false)
    props.setModalClose()
  }

  const settingChanged = () => {
    props.settingChanged()
  }

  useEffect(() => {
    setModalOpen(modalOpen)
  }, [modalOpen])

  if(userID){
    return (
      <div className="stock-setting-modal">
        <ModalWrapper
          open={isModalOpen}
          handleClose={handleModalClose}
          content={
            <SettingContents 
              userID={userID} 
              handleClose={handleModalClose} 
              handleSettingChanged={settingChanged}
            />
          }
        />
      </div>
    )
  }else{
    return <></>
  }
}

SettingModal.propTypes = {
  userID: PropTypes.string,
  modalOpen: PropTypes.bool,
  setModalClose: PropTypes.func,
  settingChanged: PropTypes.func,
}

