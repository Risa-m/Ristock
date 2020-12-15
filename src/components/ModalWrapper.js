import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Modal from '@material-ui/core/Modal';
import { withStyles } from '@material-ui/core/styles';

import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

const styles = theme => ({
  paper: {
    position: 'absolute',
    width: theme.spacing(80),
    maxWidth: "75%",
    maxHeight: "80%",
    overflow: 'auto',
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(4),
    outline: 'none',
    top: `50%`,
    left: `50%`,
    transform: `translate(-50%, -50%)`,
  },
  close: {
    position: 'fixed',
    right: '5px',
    top: '5px'
  }
});
class ModalWrapper extends Component {
  render() {
    const { classes } = this.props;
    return (
      <Modal id="Modal"
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
      open={this.props.open}
      onClose={this.props.handleClose}>
        <div className={classes.paper}>
          <IconButton aria-label="close" onClick={this.props.handleClose} className={classes.close}>
            <CloseIcon fontSize="small" />
          </IconButton> 
          {this.props.content}
        </div>
      </Modal>
    );
  }
}
ModalWrapper.propTypes = {
  classes: PropTypes.object.isRequired,
  content: PropTypes.node.isRequired,
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
};
export default withStyles(styles)(ModalWrapper);