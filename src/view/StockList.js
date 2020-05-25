import React from 'react'
import { Link } from 'react-router-dom'
import firebase, { db } from '../firebase'
import './views.css';

import { StockDetail } from './StockDetail'

import Button from '@material-ui/core/Button';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import CachedIcon from '@material-ui/icons/Cached';
import AddIcon from '@material-ui/icons/Add';

import ImageIcon from '@material-ui/icons/Image';
import ViewListIcon from '@material-ui/icons/ViewList';
import SettingsIcon from '@material-ui/icons/Settings';

export class StockList extends React.Component{ 
  constructor(props){
    super(props)

    this.state = {
      isImageShow: false,
      list: [],
      detailsItem: null
    }
  }
  async componentDidMount() {
    await this.getDocs()
  }

  async getDocs(){
    if(this.props.userID){
      let colRef = db.collection('users')
                      .doc(this.props.userID)
                      .collection('stock_items')
      let snapshots = await colRef.get()
      let docs = snapshots.docs.map(doc => [doc.id, doc.data()])
      await this.setState({list : docs})      
    }
  }

  deleteDoc(docID){
    if(this.props.userID){
      let deleteDoc = db.collection('users').doc(this.props.userID).collection('stock_items').doc(docID).delete();
      let newList = this.state.list.filter(value => value[0] !== docID)
      this.setState({list: newList})
    }
  }

  updateDoc(docID){

  }

  detailsDoc(docID){
    console.log(docID)
    //docID = "uPGdRKYK5Km3uYV9ud6j"
    let searchItem = this.state.list.filter(value => {
      console.log(value[0])
      console.log(docID)
      return value[0] === docID
    })
    console.log(searchItem)
    this.setState({detailsItem: searchItem})
    
  }

  settingColumn(){

  }


  // TODO: 写真の一覧形式とリスト形式
  render(){
    return (
    <div className="stock-list-root">
      <h2>List</h2>
      <div className="stock-list-add-link">
        {/*
        <Link to='/stocks/add'>
        <Button
        className="stock-list-add-button"
        variant="contained"
        color="default"
        startIcon={<AddIcon />}>
        Add
      </Button>
      </Link>
        */}
        <IconButton className="stock-list-add-button" aria-label="setting" onClick={this.settingColumn.bind(this)}>
          <SettingsIcon />
        </IconButton>

        
      </div>

      <div className="stock-list-table">
        <TableContainer component={Paper}>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>名称</TableCell>
                <TableCell align="right">型番</TableCell>
                <TableCell align="right">サイズ</TableCell>
                <TableCell align="right">色</TableCell>
                <TableCell align="right">数&nbsp;(個)</TableCell>
                <TableCell align="right">価格&nbsp;(円)</TableCell>
                <TableCell align="right">入り数&nbsp;(個)</TableCell>
                <TableCell align="right">カテゴリー</TableCell>
                <TableCell align="right"></TableCell>
                <TableCell align="right"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.list.map(item => (
                <TableRow key={item[0]}>
                  <TableCell component="th" scope="row">
                    {item[1].name}
                  </TableCell>
                  <TableCell align="right">{item[1].modelNumber}</TableCell>
                  <TableCell align="right">{item[1].size}</TableCell>
                  <TableCell align="right">{item[1].color}</TableCell>
                  <TableCell align="right">{item[1].stockNumber}</TableCell>
                  <TableCell align="right">{item[1].price}</TableCell>
                  <TableCell align="right">{item[1].lotSize}</TableCell>
                  <TableCell align="right">{item[1].category}</TableCell>
                  <TableCell align="right">
                    <Link to=""></Link>
                    <IconButton aria-label="update" onClick={this.detailsDoc.bind(this, item[0])}>        
                      <ViewListIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton aria-label="update" onClick={this.updateDoc.bind(this, item[0])}>
                      <CachedIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton aria-label="delete" onClick={this.deleteDoc.bind(this, item[0])}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      <div className="stock-list-details">
        {(this.state.detailsItem && this.state.detailsItem[0])?
        <Paper>
          {this.state.detailsItem[0][0]}
          <StockDetail item_id={this.state.detailsItem[0][0]} userID={this.props.userID}></StockDetail>
        </Paper>
        :
        null}
      </div>

    </div>
    )
  }
}
