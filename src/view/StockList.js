import React from 'react'
import { Link } from 'react-router-dom'
import firebase, { db } from '../firebase'
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

export class StockList extends React.Component{ 
  constructor(props){
    super(props)

    this.state = {
      list: []
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

    /*
    if(this.props.user != null){
      await db.collection('users').doc(this.props.userID).collection('stock_items').get()
      .then(snapshot => {
        let docs = snapshot.docs.map(doc => [doc.id, doc.data()])
        this.setState({list: docs})
      })
      .catch(error =>{
        console.log("Error : ", error)
      })
    }*/
  }

  deleteDoc(docID){
    if(this.props.userID){
      let deleteDoc = db.collection('users').doc(this.props.userID).collection('stock_items').doc(docID).delete();
      let newList = this.state.list.filter(value => value[0] !== docID)
      this.setState({list: newList})
    }
  }

  render(){
    return (
    <div className="stock-list-root">
      Stock List 
      <div>
        <Link to='/stocks/add'>Add Stocks</Link>
      </div>
      <div>
        <TableContainer component={Paper}>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>在庫</TableCell>
                <TableCell align="right">型番</TableCell>
                <TableCell align="right">サイズ</TableCell>
                <TableCell align="right">色</TableCell>
                <TableCell align="right">数&nbsp;(個)</TableCell>
                <TableCell align="right">価格&nbsp;(円)</TableCell>
                <TableCell align="right">入り数&nbsp;(個)</TableCell>
                <TableCell align="right">カテゴリー</TableCell>
                <TableCell align="right">削除</TableCell>
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
    </div>
    )
  }
}
