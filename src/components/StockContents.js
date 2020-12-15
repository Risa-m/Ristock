import React from 'react'
import firebase, { db } from '../firebase'
import 'asset/components.css'

import { resizeImage } from 'components/ResizeImage';
import { StockContentGridView } from 'components/StockContents/StockContentGridView';
import DBTemplate from 'components/DBTemplate';
import AccessFireBase from 'components/AccessFirebase';

import Button from '@material-ui/core/Button';

import AddRoundedIcon from '@material-ui/icons/AddRounded';
import RemoveRoundedIcon from '@material-ui/icons/RemoveRounded';


const MAX_CATEGORY_SIZE = 10
const IMAGE_MAX_SIZE = 512

export class StockContents extends React.Component{
  /*
  props: 
    item_id: 詳細表示するアイテムの固有ID
    userID: ユーザー固有ID
    handleClose: Submitしたときにデータを渡す
  */
  constructor(props){
    super(props)

    this.state = {
      item_id: props.item_id,
      data: null,

      id: "",
      name: "",
      modelNumber: "", 
      size: "",
      color: "",
      stockNumber: 0,
      price: 0,
      lotSize: 0,
      category: [],  // 表示名
      newCategoryName: "",
      old_category_id: "",
      category_id: "", // カテゴリーのid TODO: リスト化
      image_url: "", 

      local_image: null,
      local_image_src: null,

      category_map: this.props.category_map, // 全categoryの{id: name}

      submitButtonCheck: false,
    }
  }

  // mount されたときにデータをDBから取得
  async componentDidMount() {
    await this.db.getDocs(this.props.userID, this.state.item_id)
  }

  callbacks = {
    handleChanege: (property, event) => {
      // form が変更されたとき、stateも更新
      this.setState({[property]: event.target.value})
    },
    handleCategoryChanege: (event) => {
      //let new_id = Object.keys(this.state.category_map).filter(val => val === event.target.value)
      this.setState({category : this.state.category_map[event.target.value], category_id: event.target.value})
    },
    handleNewCategoryNameChange: (categoryName) => {
      this.setState({newCategoryName: categoryName})
    },
    handleImageChange: async (event) => {
      const { imageFile, imageUri } = await resizeImage(event, IMAGE_MAX_SIZE)
      this.setState({
        local_image: imageFile,
        local_image_src: imageUri,
      })  
    }
  
  }

  db = {
    getDocs: async (userID, itemID) => {
      let contentData = await AccessFireBase.getItemContent(userID, itemID)
      this.setState(DBTemplate.get_content(contentData, this.state.category_map))
    },
    imageUpload: async (userID, itemID) => {      
     if(this.state.local_image){
        let imageURL = await AccessFireBase.imageUploadToStrage(userID, itemID, this.state.local_image)
        await AccessFireBase.imageUrlRegister(userID, itemID, imageURL)
        this.setState({image_url: imageURL})
     }
    },
    addStockItems: async (userID) => {
      await this.db.checkCreateCategory(userID, this.state.category_map, this.state.newCategoryName)
      let newContentitemID = await AccessFireBase.addItemContent(userID, this.state)
      this.setState({item_id: newContentitemID})
    },
    updateStockItems: async (userID, itemID) => {
      await this.db.checkCreateCategory(userID, this.state.category_map, this.state.newCategoryName)
      await AccessFireBase.updateItemContent(userID, itemID, this.state)
    },
    addCategory: async (userID, itemID, categoryID) => {
      if(categoryID !== ""){
        let itemIDList = await AccessFireBase.getItemIDListOfCategory(userID, categoryID)
        itemIDList.push(itemID)
        await AccessFireBase.updateItemIDListOfCategory(userID, categoryID, itemIDList)
      }
    },
    updateCategory: async (userID, itemID, oldCategoryID, newcategoryID) => {
      // カテゴリ側にitemIDを登録
      if(oldCategoryID !== newcategoryID){
        if(oldCategoryID !== ""){
          // もとのカテゴリからitemIDを削除
          let oldCategoryRef = db.collection('users')
                                .doc(userID)
                                .collection('categories')
                                .doc(oldCategoryID)
          let oldCetegoryData = (await oldCategoryRef.get()).data()
          // DBからそのカテゴリが登録されているitemIDのリストを取得
          let oldCategoryItems = oldCetegoryData.item_id || []
          oldCategoryItems = oldCategoryItems.filter(item => item !== itemID)
          oldCategoryRef.update(DBTemplate.category_update_content(oldCategoryItems))
        }

        // 新しいカテゴリにitemIDを追加
        let newCategoryRef = db.collection('users')
                              .doc(userID)
                              .collection('categories')
                              .doc(newcategoryID)
        let newCetegoryData = (await newCategoryRef.get()).data()
        // DBからそのカテゴリが登録されているitemIDのリストを取得
        let newCategoryItems = newCetegoryData.item_id || []
        newCategoryItems.push(itemID)
        newCategoryRef.update(DBTemplate.category_update_content(newCategoryItems))
      }
    },
    checkCreateCategory: async (userID, category_map, categoryName) => {
      if(categoryName !== ""){
        let search = Object.keys(category_map).filter(val => category_map[val] === categoryName)
        if(search.length === 0){
          await this.db.createCategory(userID, categoryName)
        }
        else {
          this.setState({category_id: search[0]})
        }
      }
    },
    createCategory: async (userID, categoryName) => {
      let search = Object.keys(this.state.category_map).filter(val => this.state.category_map[val] === categoryName)
      if(search.length === 0){
        let userRef = db.collection('users').doc(userID)
        let categoryRef = userRef.collection('categories')
        await categoryRef.add(DBTemplate.category_create_content(categoryName))
        .then(ref => {
          // カテゴリ名とIDの紐づけ
            let new_category_map = JSON.parse(JSON.stringify(this.state.category_map)) // deep copy
            // category_mapに[id, name]を追加
            let new_category_id = ref.id
            new_category_map[new_category_id] = categoryName
            userRef.update({ category_map: new_category_map })

            this.setState({category_map: new_category_map, category_id: new_category_id})
            this.props.categoryChanged(new_category_map)
        })
      }else{
        this.setState({category_id: search[0]})
      }
    }
  }


  // update されたとき、DBを更新してモーダルに通知
  handleUpdateSubmit = async (event) => {

    this.setState({submitButtonCheck: true})

    await this.db.updateStockItems(this.props.userID, this.state.item_id)
    await this.db.imageUpload(this.props.userID, this.state.item_id)
    await this.db.updateCategory(this.props.userID, this.state.item_id, this.state.old_category_id, this.state.category_id)

    this.props.handleClose(this.state)
  }


  // add されたとき、DBに追加してモーダルに通知
  handleAddSubmit = async (event) => {

    this.setState({submitButtonCheck: true})

    await this.db.addStockItems(this.props.userID)
    await this.db.imageUpload(this.props.userID, this.state.item_id)
    await this.db.addCategory(this.props.userID, this.state.item_id, this.state.category_id)

    this.props.handleClose(this.state)
  }

  createNewCategory = async (categoryName) => {
    if(categoryName !== "" && Object.keys(this.state.category_map).length < MAX_CATEGORY_SIZE){

      this.setState({category: categoryName})      

      await this.db.createCategory(this.props.userID, categoryName)
    }
  }

  
  phonePlusMinusTemplate = (props) => {
    return (
      <div className="stock-form-phone-view">
        <div className="stock-form-phone-view-item" onClick={() => this.setState({[props.property]: (this.state[props.property]+1)})}><AddRoundedIcon /></div>
        <div className="stock-form-phone-view-item" onClick={() => (this.state[props.property] > 0)? this.setState({[props.property]: (this.state[props.property]-1)}):null}><RemoveRoundedIcon /></div>
      </div>
    )
  }


  render(){
    // Add
    if(this.props.userID && (!this.state.item_id || !this.state.data)){
      return (
      <div className="stock-add-root">
        <StockContentGridView 
          handleValueChanege={this.callbacks.handleChanege}
          createNewCategory={this.createNewCategory}
          handleValueChanege={this.callbacks.handleChanege}
          handleCategoryChanege={this.callbacks.handleCategoryChanege}
          imageChangeHandler={this.callbacks.handleImageChange}
          {...this.state}
        />

      <div className="add-stock-submit-button">
        <Button 
          variant="outlined" 
          onClick={this.handleAddSubmit} 
          disabled={!(this.state.name) || this.state.submitButtonCheck}
        >
          Save
        </Button>
      </div>
    </div>
    )
    }


    // Details and Update
    if(this.props.userID && this.state.data){
      return (
        <div className="stock-detail-root">

        <StockContentGridView 
          handleValueChanege={this.callbacks.handleChanege}
          createNewCategory={this.createNewCategory}
          handleValueChanege={this.callbacks.handleChanege}
          handleCategoryChanege={this.callbacks.handleCategoryChanege}
          imageChangeHandler={this.callbacks.handleImageChange}
          handleNewCategoryNameChange={this.callbacks.handleNewCategoryNameChange}
          {...this.state}
        />
        <div className="update-stock-submit-button">
          <Button 
          variant="outlined" 
          onClick={this.handleUpdateSubmit} 
          disabled={!(this.state.name) || this.state.submitButtonCheck}
          >
            Save
          </Button>
        </div>

      </div> 

      )
    }
    return (
    <div className="stock-detail-root">
    </div>
    )
  }
}

