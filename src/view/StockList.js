import React from 'react'
import { Link } from 'react-router-dom'
import firebase, { db } from '../firebase'
import './views.css';

import { StockContents } from '../components/StockContents'
import ModalWrapper from '../components/ModalWrapper'

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';

import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';

import ImageIcon from '@material-ui/icons/Image';
import ViewListIcon from '@material-ui/icons/ViewList';
import SettingsIcon from '@material-ui/icons/Settings';
import CategoryIcon from '@material-ui/icons/Category';

export class StockList extends React.Component{ 
  constructor(props){
    super(props)

    this.state = {
      isUserDataLoaded: false,
      isImageShow: false,
      list: [],
      detailsItemID: null,
      detailsItem: null,
      addItem: false,
      modalopen: false,
      visible: VisibleViewString.list
    }
  }
  async componentDidMount() {
    await this.getDocs()
  }

  // Note: state update but not render
  async getUserData(){
    this.state.isUserDataLoaded = true
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
      let delete_image_url = this.state.list.filter(value => value[0] === docID)[0].image_url
      console.log(delete_image_url)
      if(delete_image_url){
        var desertRef = firebase.storage().ref().child(`users/${this.props.userID}/${docID}.jpg`);
        desertRef.delete().then(ref => {console.log("delete image ", docID)}).catch(error => {});
      }
      let deleteDoc = db.collection('users').doc(this.props.userID).collection('stock_items').doc(docID).delete();
      let newList = this.state.list.filter(value => value[0] !== docID)
      this.setState({list: newList})
    }
  }
  detailsDoc(docID){
    console.log("[Stock List] details docID",docID)
    let searchItem = this.state.list.filter(value => {
      return value[0] === docID
    })
    this.setState({detailsItem: searchItem, detailsItemID: docID, modalopen:true})    
  }

  addDoc(){
    this.setState({addItem: true, modalopen: true})
  }

  handleClose(){
    this.setState({
      detailsItemID: null,
      detailsItem: null,
      addItem: false,
      modalopen: false
    })
  }

  async handleSubmitClose(props){
    let newList = this.state.list.slice()
    // Add
    if(this.state.addItem){
      newList.push([props.item_id, props])
    }
    // Update
    else if(this.state.detailsItemID){
      newList = this.state.list.map(item => {
        if(item[0] == this.state.detailsItemID){
          console.log("[Stock List] new list item",[this.state.detailsItemID, props])
          return [this.state.detailsItemID, props]
        }else{
          return item
        }
      })  
    }
    console.log("[Stock List] newList: ",newList)
    this.setState({list: newList})
    this.handleClose()
  }

  settingColumn(){
    let currentView = this.state.visible
    let viewNumber = Object.keys(VisibleViewString).length
    if(currentView+1 < viewNumber){
      this.setState({visible: (currentView+1)})      
    }
    else{
      this.setState({visible: 0})
    }
  }


  listTemplate = (props) => {
    if(props.visible){
      return (
        <div className="stock-list-table">
        <TableContainer component={Paper}>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell></TableCell>
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
                    <img src={item[1].image_url} width="50"/>
                  </TableCell>
                  <TableCell align="right">{item[1].name}</TableCell>
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
      )  
    }
    else{
      return null
    }
  }

  imageTemplate = (props) => {
    if(props.visible){
      return(
      <div className="stock-list-image">
      <Grid container>
        {this.state.list.map(item => (
            <Grid item xs={4} sm={3} md={2} lg={1} key={item[0]} style={{marginBottom: "10px"}}>
                <img src={item[1].image_url} width="80"  onClick={this.detailsDoc.bind(this, item[0])}/>
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


  // TODO: 写真の一覧形式とリスト形式
  render(){
    if(!this.state.isUserDataLoaded && this.props.userID){
      this.getUserData()
    }

    return (
    <div className="stock-list-root">
      <div className="stock-list-add-link">
        <IconButton className="stock-list-add-button" aria-label="setting" onClick={this.settingColumn.bind(this)}>
          <SettingsIcon />
        </IconButton>

        <IconButton className="stock-list-add-button" aria-label="setting" onClick={this.addDoc.bind(this)}>
          <AddIcon />
        </IconButton>

      </div>
      <this.listTemplate visible={this.state.visible===VisibleViewString.list} />
      <this.imageTemplate visible={this.state.visible===VisibleViewString.image} />

      <div className="stock-list-details-modal">
      {((this.state.detailsItem && this.state.detailsItemID) || this.state.addItem)?
      <ModalWrapper
      open={this.state.modalopen}
      handleClose={this.handleClose.bind(this)}
      content={<StockContents item_id={this.state.detailsItemID} userID={this.props.userID} handleClose={this.handleSubmitClose.bind(this)}/>}
     />:null
       }
       </div>
    </div>
    )
  }
}


const VisibleViewString = {
  list: 0,
  image: 1,
}