import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Modal from '@material-ui/core/Modal';
import { withStyles } from '@material-ui/core/styles';


const styles = theme => ({
  paper: {
    position: 'absolute',
    width: theme.spacing(50),
    maxWidth: "100%",
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    padding: theme.spacing(4),
    outline: 'none',
    top: `50%`,
    left: `50%`,
    transform: `translate(-50%, -50%)`,
  },
});
class ModalWrapper extends Component {
  render() {
    console.log("modal render");
    console.log(this.props.open)
    const { classes } = this.props;
    return (
      <Modal id="Modal"
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
      open={this.props.open}
      onClose={this.props.handleClose}>
        <div className={classes.paper}>
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