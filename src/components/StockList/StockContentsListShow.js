import React from 'react'
import 'asset/views.css';
import PropTypes from 'prop-types';

import cellNameToLabels from 'components/cellNameToLabels'

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';

import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';

export const StockContentsListShow = (props) => {
  const { visible, show_list } = props

  const itemThumbnailImage = (image_url, thumbSize) => {
    if(image_url){
      return <img src={image_url} width={thumbSize}/>
    }
    else {
      return <img src="image/no_image.png" width={thumbSize}/>
    }
  }

  if(visible){
    return (
      <div className="stock-list-table">
      <TableContainer component={Paper}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>{/* image */}</TableCell>
              {cellNameToLabels.map((cellName, idx) => (
                  <TableCell align="center" key={idx}>{cellName.label}</TableCell>  
                ))}
              <TableCell align="center">{/* detail */}</TableCell>
              <TableCell align="center">{/* delete */}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {show_list.map(item => (
              <TableRow key={item[0]}>
                <TableCell >{itemThumbnailImage(item[1].image_url, 80)}</TableCell>

                {cellNameToLabels.map((cellName, idx) => (
                  <TableCell align="center" key={idx}>{item[1][cellName.value]}</TableCell>  
                ))}

                <TableCell align="center">
                  <IconButton aria-label="update" onClick={() => props.detailsDoc(item[0])}>        
                    <EditIcon />
                  </IconButton>
                </TableCell>
                <TableCell align="center">
                  <IconButton aria-label="delete" onClick={() => props.deleteDoc(item[0])}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
    )  
  }
  else{
    return null
  }
}


StockContentsListShow.propTypes = {
  visible: PropTypes.bool,
  show_list: PropTypes.array,
  detailsDoc: PropTypes.func,
  deleteDoc: PropTypes.func,
}

