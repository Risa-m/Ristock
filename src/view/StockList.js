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
      visible: VisibleViewString.image,
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
      console.log(delete_item)
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
      console.log(value[1])
      console.log(val)
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
                <TableCell align="center">型番</TableCell>
                <TableCell align="center">サイズ</TableCell>
                <TableCell align="center">色</TableCell>
                <TableCell align="center">数&nbsp;(個)</TableCell>
                <TableCell align="center">価格&nbsp;(円)</TableCell>
                {/*<TableCell align="center">入り数&nbsp;(個)</TableCell>*/}
                <TableCell align="center">カテゴリー</TableCell>
                <TableCell align="center"></TableCell>
                <TableCell align="center"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.show_list.map(item => (
                <TableRow key={item[0]}>
                  <TableCell component="th" scope="row">
                    {(item[1].image_url)?
                    <img src={item[1].image_url} width="80"/>
                    :
                    <img src="image/no_image.png" width="80"/>
                  }
                  </TableCell>
                  <TableCell >{item[1].name}</TableCell>
                  <TableCell align="center">{item[1].modelNumber}</TableCell>
                  <TableCell align="center">{item[1].size}</TableCell>
                  <TableCell align="center">{item[1].color}</TableCell>
                  <TableCell align="center">{item[1].stockNumber}</TableCell>
                  <TableCell align="center">{item[1].price}</TableCell>
                  {/*<TableCell align="center">{item[1].lotSize}</TableCell>*/}
                  <TableCell align="center">{item[1].category}</TableCell>
                  <TableCell align="center">
                    <Link to=""></Link>
                    <IconButton aria-label="update" onClick={this.detailsDoc.bind(this, item[0])}>        
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell align="center">
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
      <Grid container spacing={1}>
        {this.state.show_list.map(item => (
            <Grid item xs={6} sm={4} md={3} lg={2} xl={1} key={item[0]}>
              <div className="stock-list-image-item">
                <span className="square-content">
                {(item[1].image_url)?
                  <img src={item[1].image_url} width="100%" onClick={this.detailsDoc.bind(this, item[0])} alt={item[1].name}/>
                  :
                  <img src="image/no_image.png" width="100%" onClick={this.detailsDoc.bind(this, item[0])} alt={item[1].name}/>
                }
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

  categoryTemplate = () => {
    return (
      <div className="stock-list-categories">
        {(this.state.isCategoryShow)?
        <>
        <div className="stock-list-categories-show">
          {Object.keys(this.state.category_map).map((val, idx) => (
          //{this.state.category_list.map((val, idx) => (
          (val)?
          <Chip label={this.state.category_map[val]} variant={this.state.selectedCategory === val ? "default":"outlined"} key={idx} color="primary" onClick={this.handleCategorySelect.bind(this, val)} />
          :
          null
          ))}
          <Chip label="No category" variant={this.state.selectedCategory === "" ? "default":"outlined"} key={-2} onClick={this.handleCategorySelectNone.bind(this)} />
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
    )
  }

  settingButtonTemplate = () => {
    return(
      <div className="stock-list-buttons">
        <IconButton className="stock-list-view-button" aria-label="view change" onClick={this.settingColumn.bind(this)}>
          {(this.state.visible === VisibleViewString.image)?
          <ListIcon />
          :
          (this.state.visible === VisibleViewString.list)?
          <ImageIcon />
          :
          null
          }
        </IconButton>

        <IconButton className="stock-list-add-button" aria-label="add" onClick={this.addDoc.bind(this)}>
          <AddIcon />
        </IconButton>
        {/*
        <IconButton className="stock-list-setting-button" aria-label="setting" onClick={this.settingChange}>
          <SettingsIcon />
        </IconButton>
        */}
      </div>
    )
  }

  render(){
    if(!this.state.isUserDataLoaded && this.props.userID){
      this.getUserData()
    }

    return (
    <div className="stock-list-root">

      {//<this.categoryTemplate/>
      }
      <CategorySelectionShow category_map={this.state.category_map} data_list={this.state.data_list} show_list={this.state.show_list} selectedCategory={this.state.selectedCategory} handleCategorySelect={this.handleCategorySelect.bind(this)} handleCategorySelectNone={this.handleCategorySelectNone.bind(this)} handleCategorySelectAll={this.handleCategorySelectAll.bind(this)}/>

      {//<this.settingButtonTemplate/>
      }
      {<StockListSettingButtonsShow current_view={this.state.visible} settingColumn={this.settingColumn.bind(this)} addDoc={this.addDoc.bind(this)}/>}

      {
      //<this.listTemplate visible={this.state.visible===VisibleViewString.list} />
      }
      <StockContentsListShow visible={this.state.visible===VisibleViewString.list} show_list={this.state.show_list} detailsDoc={this.detailsDoc.bind(this)} deleteDoc={this.deleteDoc.bind(this)} />
      <StockContentsImageShow visible={this.state.visible===VisibleViewString.image} show_list={this.state.show_list} detailsDoc={this.detailsDoc.bind(this)}/>      
      {
      //<this.imageTemplate visible={this.state.visible===VisibleViewString.image} />
      }


      {/* 詳細・更新モーダル */}
      <div className="stock-list-details-modal">
      {((/*this.state.detailsItem && */this.state.detailsItemID) || (this.state.addItem && this.state.data_list.length <= MAX_USER_ITEMS))?
      <ModalWrapper
      open={this.state.modalopen}
      handleClose={this.handleClose.bind(this)}
      content={<StockContents item_id={this.state.detailsItemID} userID={this.props.userID} category_list={this.state.category_list} category_map={this.state.category_map} handleClose={this.handleSubmitClose.bind(this)}/>}
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