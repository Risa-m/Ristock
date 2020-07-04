import React from 'react'
import { Link } from 'react-router-dom'
import firebase, { db } from '../firebase'
import './views.css';
import PropTypes from 'prop-types';

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
//import ExpandLessIcon from '@material-ui/icons/ExpandLess';

import ImageIcon from '@material-ui/icons/Image';
import ViewListIcon from '@material-ui/icons/ViewList';
import SettingsIcon from '@material-ui/icons/Settings';
//import CategoryIcon from '@material-ui/icons/Category';
import ListIcon from '@material-ui/icons/List';
import EditIcon from '@material-ui/icons/Edit';

const MAX_USER_ITEMS = 1000

export class StockList extends React.Component{ 
  /*
  props: 
    userID: ユーザー固有ID
   */
  constructor(props){
    super(props)

    this.state = {
      isUserDataLoaded: false,
      data_list: [], // 全アイテムの[id, data]のリスト
      show_list: [], // 表示するアイテムの[id, data]のリスト
      category_list: [""], // 全カテゴリのリスト
      category_map: {},

      isCategoryShow: true,
      selectedCategory: "all",

      detailsItemID: null,
      //detailsItem: null,
      addItem: false,
      modalopen: false,
      current_view: VisibleViewString.image,
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
      let categoryList = (categoryDoc.data()).category || [""]
      let categoryMap = (categoryDoc.data()).category_map || {}

      let colRef = db.collection('users')
                      .doc(this.props.userID)
                      .collection('stock_items')
      let snapshots = await colRef.get()
      let docs = snapshots.docs.map(doc => [doc.id, doc.data()])
      this.setState({data_list: docs, show_list : docs, category_map: categoryMap, category_list: categoryList}) 
    }
  }

  deleteDoc(docID){
    if(this.props.userID){
      let delete_item = this.state.data_list.filter(value => value[0] === docID)[0]
      if(delete_item[1].image_url){
        var deleteRef = firebase.storage().ref().child(`users/${this.props.userID}/${docID}.jpg`);
        deleteRef.delete()
      }
      db.collection('users').doc(this.props.userID).collection('stock_items').doc(docID).delete();
      let newDataList = this.state.data_list.filter(value => value[0] !== docID)
      let newShowList = this.state.show_list.filter(value => value[0] !== docID)
      this.setState({data_list: newDataList, show_list: newShowList})
    }
  }

  detailsDoc(docID){
    let searchItem = this.state.data_list.filter(value => {
      return value[0] === docID
    })
    this.setState({/*detailsItem: searchItem,*/ detailsItemID: docID, modalopen:true})    
  }

  canUserAddDocs(){
    if(this.state.data_list.length <= MAX_USER_ITEMS){
      return true
    }
    else{
      return false
    }
  }

  addDoc(){
    this.setState({addItem: true, modalopen: true})
  }

  handleClose(){
    this.setState({
      detailsItemID: null,
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
        if(item[0] === this.state.detailsItemID){
          return [this.state.detailsItemID, props]
        }else{
          return item
        }
      })
    }
    this.setState({data_list: newList, show_list: newList, category_list: props.category_list, category_map: props.category_map, selectedCategory: "all"})
    this.handleClose()
  }

  settingColumn(){
    let currentView = this.state.current_view
    let viewNumber = Object.keys(VisibleViewString).length
    if(currentView+1 < viewNumber){
      this.setState({current_view: (currentView+1)})      
    }
    else{
      this.setState({current_view: 0})
    }
  }
  handleCategorySelectAll() {
    this.setState({show_list: this.state.data_list, selectedCategory: " "})
  }

  handleCategorySelectNone() {
    let selected_list = this.state.data_list.filter(value => {
      // カテゴリIDが存在しないときまたは空白のとき
      return !(value[1]).category_id || ((value[1]).category_id && (value[1].category_id) === "")
      //return !(value[1]).category_id || ((value[1]).category_id && (value[1].category_id).length == 0)
    })
    this.setState({show_list: selected_list, selectedCategory: ""})
  }

  handleCategorySelect(val) {
    let selected_list = this.state.data_list.filter(value => {
      /*
      if((value[1]).category_id && (value[1].category_id).length > 0){
        // 各項目のcategory_idのリストの中に、検索したいカテゴリIDが含まれているかどうかチェック
        return ((value[1].category_id).indexOf(val) >= 0)
      }
      */
     return value[1].category_id === val
    })
    this.setState({show_list: selected_list, selectedCategory: val})
  }


  render(){
    if(!this.state.isUserDataLoaded && this.props.userID){
      this.getUserData()
    }

    return (
    <div className="stock-list-root">

      <CategorySelectionShow 
        category_map={this.state.category_map} 
        data_list={this.state.data_list} 
        show_list={this.state.show_list} 
        selectedCategory={this.state.selectedCategory} 
        handleCategorySelect={this.handleCategorySelect.bind(this)} 
        handleCategorySelectNone={this.handleCategorySelectNone.bind(this)} 
        handleCategorySelectAll={this.handleCategorySelectAll.bind(this)}
      />

      <StockListSettingButtonsShow 
        current_view={this.state.current_view} 
        settingColumn={this.settingColumn.bind(this)} 
        addDoc={this.addDoc.bind(this)}
      />

      <StockContentsListShow 
        visible={this.state.current_view===VisibleViewString.list} 
        show_list={this.state.show_list} 
        detailsDoc={this.detailsDoc.bind(this)} 
        deleteDoc={this.deleteDoc.bind(this)} 
      />

      <StockContentsImageShow 
        visible={this.state.current_view===VisibleViewString.image} 
        show_list={this.state.show_list} 
        detailsDoc={this.detailsDoc.bind(this)}
      />      

      {
      <StockDetailsUpdateModalView
        userID={this.props.userID}
        detailsItemID={this.state.detailsItemID}
        wantToAddItem={this.state.addItem}
        modalOpen={this.state.modalopen}
        category_list={this.state.category_list}
        category_map={this.state.category_map}
        canUserAddDocs={this.canUserAddDocs.bind(this)}
        handleClose={this.handleClose.bind(this)}
        handleSubmitClose={this.handleSubmitClose.bind(this)}
      />
      }

      {/* 詳細・更新モーダル */}
      <div className="stock-list-details-modal">
      {/*((this.state.detailsItemID) || (this.state.addItem && this.state.data_list.length <= MAX_USER_ITEMS))?
      <ModalWrapper
        open={this.state.modalopen}
        handleClose={this.handleClose.bind(this)}
        content={
        <StockContents
          item_id={this.state.detailsItemID} 
          userID={this.props.userID} 
          category_list={this.state.category_list} 
          category_map={this.state.category_map} 
          handleClose={this.handleSubmitClose.bind(this)}
        />}
      />:null
        */}
      </div>


    </div>
    )
  }
}

const VisibleViewString = {
  list: 0,
  image: 1,
}


const StockDetailsUpdateModalView = (props) => {
  const { userID, detailsItemID, wantToAddItem, modalOpen, category_list, category_map } = props

  if((detailsItemID) || (wantToAddItem && props.canUserAddDocs())){
    return (
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
          />}
      />
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
}

const StockListSettingButtonsShow = (props) => {
  const { current_view } = props

  const listViewButton = (current_view) => {
    if(current_view === VisibleViewString.image){
      return <ListIcon />
    }
    else if(current_view === VisibleViewString.list){
      return <ImageIcon />
    }
    else {
      return null
    }
  }

  return(
    <div className="stock-list-buttons">
      <IconButton className="stock-list-view-button" aria-label="view change" onClick={() => props.settingColumn()}>
        {listViewButton(current_view)}
      </IconButton>

      <IconButton className="stock-list-add-button" aria-label="add" onClick={() => props.addDoc()}>
        <AddIcon />
      </IconButton>
    </div>
  )
}

StockListSettingButtonsShow.protoTypes = {
  current_view: PropTypes.bool,
  settingColumn: PropTypes.func,
  addDoc: PropTypes.func
}


/* カテゴリの選択 */
const CategorySelectionShow = (props) => {
  const { category_map, selectedCategory } = props

  const isEmpty = (obj) => {
    return !Object.keys(obj).length;
  }
  const categoryChip = (category_map) => {
    if(!isEmpty(category_map)){
      return (
        Object.keys(category_map).map((val, idx) => (
          <Chip 
            label={category_map[val]} 
            variant={selectedCategory === val ? "default":"outlined"} 
            key={idx} 
            color="primary" 
            onClick={() => props.handleCategorySelect(val)} />
        ))
      )
    }
    else{
      return null
    }
  }

  return (
    <div className="stock-list-categories">
      <div className="stock-list-categories-show">
        {categoryChip(category_map)}
        <Chip label="No category" variant={props.selectedCategory === "" ? "default":"outlined"} key={-2} onClick={()=> props.handleCategorySelectNone()} />
        <Chip label="All Category" variant={props.data_list.length === props.show_list.length ? "default":"outlined"} key={-1} onClick={() => props.handleCategorySelectAll()} />
        </div>
    </div>
  )
}

CategorySelectionShow.propTypes = {
  category_map: PropTypes.object,
  selectedCategory: PropTypes.string,
  handleCategorySelect: PropTypes.func,
  handleCategorySelectNone: PropTypes.func,
  handleCategorySelectAll: PropTypes.func,
  data_list: PropTypes.array,
  show_list: PropTypes.array,
}

const StockContentsListShow = (props) => {
  const { visible, show_list } = props

  const cellNameToLabels = [
    {label: "名称", value: "name"},
    {label: "型番", value: "modelNumber"},
    {label: "サイズ", value: "size"},
    {label: "色", value: "color"},
    {label: "数　(個)", value: "stockNumber"},
    {label: "価格　(円)", value: "price"},
    {label: "カテゴリー", value: "category"},
  ]

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


const StockContentsImageShow = (props) => {
  const { visible, show_list } = props

  const imageView = (item) => {
    if(item[1].image_url){
      return <img src={item[1].image_url} width="100%" onClick={() => props.detailsDoc(item[0])} alt={item[1].name}/>
    }
    else{
      return <img src="image/no_image.png" width="100%" onClick={() => props.detailsDoc(item[0])} alt={item[1].name}/>
    }
  }
  
  if(visible){
    return(
    <div className="stock-list-image">
      <Grid container spacing={1}>
        {show_list.map(item => (
            <Grid item xs={6} sm={4} md={3} lg={2} xl={1} key={item[0]}>
              <div className="stock-list-image-item">
                <span className="square-content">
                {imageView(item)}
                </span>
              <p className="stock-list-image-name">{item[1].name}</p>
              <p>{item[1].modelNumber} {item[1].size} {item[1].color}</p>
              <p className="stock-list-image-stock">{item[1].stockNumber}</p>
              </div>
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

StockContentsImageShow.propTypes = {
  visible: PropTypes.bool,
  show_list: PropTypes.array,
  detailsDoc: PropTypes.func,
}