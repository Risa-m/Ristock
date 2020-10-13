import React from 'react'
import firebase, { db } from '../firebase'
import 'asset/components.css'
import PropTypes from 'prop-types';

import { resizeImage } from 'components/ResizeImage';
import { StockContentGridView } from 'components/StockContents/StockContentGridView';

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
      if(userID && itemID){
        let itemRef = db.collection('users')
                        .doc(userID)
                        .collection('stock_items')
                        .doc(itemID)
        let doc = await itemRef.get()
        this.setState({
          data: doc.data(),
          name: doc.data().name,
          modelNumber: doc.data().modelNumber,
          size: doc.data().size,
          color: doc.data().color,
          stockNumber: doc.data().stockNumber,
          price: doc.data().price,
          lotSize: doc.data().lotSize,
          old_category_id: doc.data().category_id || "",
          category_id: doc.data().category_id || "",
          category: this.state.category_map[doc.data().category_id] || "",
          image_url: doc.data().image_url || "",
        })
      }  
    },
    /*
    imageUpload: async (userID, itemID) => {
      // 画像ファイルの保存
      let itemRef = db.collection('users')
                      .doc(userID)
                      .collection('stock_items')
                      .doc(itemID)

      const imageUploadPromise = new Promise((resolve, reject) => {
        if(this.state.local_image){
          let storageRef = firebase.storage().ref().child(`users/${userID}/${itemID}.jpg`);
          storageRef.put(this.state.local_image)
          .then(snapshot => {
            snapshot.ref.getDownloadURL().then(url => {
              itemRef.set({image_url: url}, { merge: true });
              this.setState({image_url: url})
              resolve()
            })
          });
        }
        else{
          resolve()
        }
      })
      await imageUploadPromise
    },
    addStockItems: async (userID) => {
      await this.db.checkCreateCategory(userID, this.state.category_map, this.state.newCategoryName)
      let addDoc = db.collection('users')
                    .doc(userID)
                    .collection('stock_items')
      await addDoc.add({
        name: this.state.name,
        modelNumber: this.state.modelNumber,
        size: this.state.size,
        color: this.state.color,
        stockNumber: this.state.stockNumber,
        price: this.state.price,
        lotSize: this.state.lotSize,
        category: this.state.category,
        category_id: this.state.category_id,
        created_at: firebase.firestore.FieldValue.serverTimestamp(),
        updated_at: firebase.firestore.FieldValue.serverTimestamp()
      }).then(ref => {
        this.setState({item_id: ref.id})  
      })
    },
    updateStockItems: async (userID, itemID) => {
      await this.db.checkCreateCategory(userID, this.state.category_map, this.state.newCategoryName)
      let itemRef = db.collection('users')
                      .doc(userID)
                      .collection('stock_items')
                      .doc(itemID)
      await itemRef.update({
        name: this.state.name,
        modelNumber: this.state.modelNumber,
        size: this.state.size,
        color: this.state.color,
        stockNumber: this.state.stockNumber,
        price: this.state.price,
        lotSize: this.state.lotSize,
        category: this.state.category,
        category_id: this.state.category_id,
        updated_at: firebase.firestore.FieldValue.serverTimestamp()
      })
    },
    addCategory: async (userID, itemID, categoryID) => {
      // カテゴリにitemIDを追加
      if(this.state.category_id !== ""){
        let newCategoryRef = db.collection('users')
                              .doc(userID)
                              .collection('categories')
                              .doc(categoryID)
        let newCetegoryData = (await newCategoryRef.get()).data()
        // DBからそのカテゴリが登録されているitemIDのリストを取得
        let newCetegoryItems = newCetegoryData.item_id || []
        newCetegoryItems.push(itemID)
        newCategoryRef.update({
          item_id: newCetegoryItems,
          updated_at: firebase.firestore.FieldValue.serverTimestamp()    
        })
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
          oldCategoryRef.update({
            item_id: oldCategoryItems,
            updated_at: firebase.firestore.FieldValue.serverTimestamp()    
          })
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
        newCategoryRef.update({
          item_id: newCategoryItems,
          updated_at: firebase.firestore.FieldValue.serverTimestamp()    
        })
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
        await categoryRef.add({
          name: categoryName,
          item_id: [],
          created_at: firebase.firestore.FieldValue.serverTimestamp(),
          updated_at: firebase.firestore.FieldValue.serverTimestamp()    
        }).then(ref => {
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
    }*/
  }

  handleSubmit = async () => {
    console.log("content submit")
    this.setState({submitButtonCheck: true})
    this.props.handleSubmitClose(this.state)
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

      await this.props.createCategory(this.props.userID, categoryName)
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
          onClick={this.handleSubmit} 
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
          onClick={this.handleSubmit} 
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

StockContents.propTypes = {
  item_id: PropTypes.string,
  userID: PropTypes.string,
  category_map: PropTypes.object,
  handleClose: PropTypes.func,
  categoryChanged: PropTypes.func,
}

