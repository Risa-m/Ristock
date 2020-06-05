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
import Chip from '@material-ui/core/Chip';

import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';

import ImageIcon from '@material-ui/icons/Image';
import ViewListIcon from '@material-ui/icons/ViewList';
import SettingsIcon from '@material-ui/icons/Settings';
import CategoryIcon from '@material-ui/icons/Category';
import ListIcon from '@material-ui/icons/List';

const MAX_USER_ITEMS = 1000

export class StockList extends React.Component{ 
  constructor(props){
    super(props)

    this.state = {
      isUserDataLoaded: false,
      data_list: [],
      show_list: [],
      category_list: [" "],
      isCategoryShow: true,
      selectedCategory: "all",
      detailsItemID: null,
      detailsItem: null,
      addItem: false,
      modalopen: false,
      visible: VisibleViewString.image
    }
  }
  componentDidMount() {
    this.getDocs()
  }

  // Note: state update but not render
  getUserData(){
    if(!this.state.isUserDataLoaded){
      this.state.isUserDataLoaded = true
      this.getDocs()  
    }
  }

  async getDocs(){
    if(this.props.userID){
      var categoryRef = db.collection('users').doc(this.props.userID)
      let categoryDoc = await categoryRef.get()
      let categoryList = (categoryDoc.data()).category || [" "]
  
      let colRef = db.collection('users')
                      .doc(this.props.userID)
                      .collection('stock_items')
      let snapshots = await colRef.get()
      let docs = snapshots.docs.map(doc => [doc.id, doc.data()])
      this.setState({data_list: docs, show_list : docs, category_list: categoryList}) 
    }
  }

  deleteDoc(docID){
    if(this.props.userID){
      let delete_item = this.state.data_list.filter(value => value[0] === docID)[0]
      if(delete_item[1]){
        var deleteRef = firebase.storage().ref().child(`users/${this.props.userID}/${docID}.jpg`);
        deleteRef.delete()
      }
      let deleteDoc = db.collection('users').doc(this.props.userID).collection('stock_items').doc(docID).delete();
      let newDataList = this.state.data_list.filter(value => value[0] !== docID)
      let newShowList = this.state.show_list.filter(value => value[0] !== docID)
      this.setState({data_list: newDataList, show_list: newShowList})
    }
  }

  detailsDoc(docID){
    let searchItem = this.state.data_list.filter(value => {
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
      modalopen: false,
    })
  }

  async handleSubmitClose(props){
    let newList = this.state.data_list.slice()
    // Add
    if(this.state.addItem){
      newList.push([props.item_id, props])
    }
    // Update
    else if(this.state.detailsItemID){
      newList = this.state.data_list.map(item => {
        if(item[0] == this.state.detailsItemID){
          return [this.state.detailsItemID, props]
        }else{
          return item
        }
      })  
    }
    this.setState({data_list: newList, show_list: newList, category_list: props.category_list})
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
  handleCategorySelectAll() {
    this.setState({show_list: this.state.data_list, selectedCategory: ""})
  }

  handleCategorySelect(val) {
    let selected_list = this.state.data_list.filter(value => {
      return value[1].category === val
    })
    this.setState({show_list: selected_list, selectedCategory: val})
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
              {this.state.show_list.map(item => (
                <TableRow key={item[0]}>
                  <TableCell component="th" scope="row">
                    {(item[1].image_url)?
                    <img src={item[1].image_url} width="50"/>
                    :
                    <img src="image/no_image.png" width="50"/>
                  }
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
        {this.state.show_list.map(item => (
            <Grid item xs={4} sm={2} md={1} key={item[0]} style={{marginBottom: "10px"}}>
              {(item[1].image_url)?
                <img src={item[1].image_url} width="80%" onClick={this.detailsDoc.bind(this, item[0])} alt={item[1].name}/>
                :
                <img src="image/no_image.png" width="80%" onClick={this.detailsDoc.bind(this, item[0])} alt={item[1].name}/>
              }
              <p>{item[1].name}</p>
              <p>のこり：{item[1].stockNumber}</p>
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

  render(){
    if(!this.state.isUserDataLoaded && this.props.userID){
      this.getUserData()
    }

    return (
    <div className="stock-list-root">

      <div className="stock-list-categories">
        {(this.state.isCategoryShow)?
        <>
        <div className="stock-list-categories-show">
          {this.state.category_list.map((val, idx) => (
          (val)?
          <Chip label={val} variant={this.state.selectedCategory === val ? "default":"outlined"} key={idx} color="primary" onClick={this.handleCategorySelect.bind(this, val)} />
          :
          <Chip label="No category" variant={this.state.selectedCategory === " " ? "default":"outlined"} key={idx} onClick={this.handleCategorySelect.bind(this, val)} />
          ))}
          <Chip label="All Category" variant={this.state.data_list.length===this.state.show_list.length? "default":"outlined"} key={-1} onClick={this.handleCategorySelectAll.bind(this)} />
          </div>
          {/*
          <div className="stock-list-categories-expand" >
            <ExpandLessIcon onClick={e => this.setState({isCategoryShow: false})}/>
          </div>
          */}
        </>
        :
        <>
        <div className="stock-list-categories-show">
          <Chip label="All Categories" variant={this.state.data_list.length===this.state.show_list.length? "default":"outlined"} key={-1} onClick={this.handleCategorySelectAll.bind(this)} />
        </div>
        <div className="stock-list-categories-expand">
          <ExpandMoreIcon className="stock-list-categories-expand" onClick={e => this.setState({isCategoryShow: true})}/>
        </div>
        </>
        }

      </div>


      <div className="stock-list-buttons">
        <IconButton className="stock-list-setting-button" aria-label="setting" onClick={this.settingColumn.bind(this)}>
          {(this.state.visible === VisibleViewString.image)?
          <ListIcon />
          :
          (this.state.visible === VisibleViewString.list)?
          <ImageIcon />
          :
          <SettingsIcon />
          }
        </IconButton>

        <IconButton className="stock-list-add-button" aria-label="add" onClick={this.addDoc.bind(this)}>
          <AddIcon />
        </IconButton>

      </div>



      <this.listTemplate visible={this.state.visible===VisibleViewString.list} />
      <this.imageTemplate visible={this.state.visible===VisibleViewString.image} />

      <div className="stock-list-details-modal">
      {((this.state.detailsItem && this.state.detailsItemID) || (this.state.addItem && this.state.data_list.length <= MAX_USER_ITEMS))?
      <ModalWrapper
      open={this.state.modalopen}
      handleClose={this.handleClose.bind(this)}
      content={<StockContents item_id={this.state.detailsItemID} userID={this.props.userID} category_list={this.state.category_list} handleClose={this.handleSubmitClose.bind(this)}/>}
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