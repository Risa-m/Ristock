import React from 'react'
import firebase, { db } from '../firebase'
import './components.css'

import { resizeImage } from 'components/ResizeImage';
import { StockContentGridView } from 'components/StockContents/StockContentGridView';

import Button from '@material-ui/core/Button';

import AddRoundedIcon from '@material-ui/icons/AddRounded';
import RemoveRoundedIcon from '@material-ui/icons/RemoveRounded';


const MAX_CATEGORY_SIZE = 100
const IMAGE_MAX_SIZE = 512

export class StockContents extends React.Component{
  /*
  props: 
    item_id: 詳細表示するアイテムの固有ID
    category_list: 全カテゴリのリスト
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
      old_category_id: "",
      category_id: "", // カテゴリーのid TODO: リスト化
      image_url: "",      

      local_image: null,
      local_image_src: null,

      isAddCategoryOpen: false,
      addCategoryText: "",
      category_list: this.props.category_list, // 全category 名前のリスト
      category_map: this.props.category_map, // 全categoryの{id: name}

      submitButtonCheck: false,
    }
  }

  // mount されたときにデータをDBから取得
  async componentDidMount() {
    await this.getDocs()
  }

  // userID と itemIDからデータをDBから取得し、stateに保存
  async getDocs(){
    if(this.props.userID && this.state.item_id){
      let itemRef = db.collection('users')
                      .doc(this.props.userID)
                      .collection('stock_items')
                      .doc(this.state.item_id)
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
    handleImageChange: async (event) => {
      const { imageFile, imageUri } = await resizeImage(event, IMAGE_MAX_SIZE)
      this.setState({
        local_image: imageFile,
        local_image_src: imageUri,
      })  
    }
  
  }

  db = {
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
        //console.log('Added document with ID: ', ref.id);
        this.setState({item_id: ref.id})  
      })
    },
    updateStockItems: async (userID, itemID) => {
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
      }).then(ref => {
        // undefined
        //console.log('Updated document : ', ref);
      })
      return itemRef
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
          item_id: newCetegoryItems
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
            item_id: oldCategoryItems
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
          item_id: newCategoryItems
        })
      }
    }
  }


  // update されたとき、DBを更新してモーダルに通知
  async handleUpdateSubmit(event){

    this.setState({submitButtonCheck: true})

    /*
    // 画像ファイルの保存
    const imageUploadPromise = new Promise((resolve, reject) => {
      if(this.state.local_image){
        let storageRef = firebase.storage().ref().child(`users/${this.props.userID}/${this.state.item_id}.jpg`);
        storageRef.put(this.state.local_image)
        .then(snapshot => {
          snapshot.ref.getDownloadURL().then(url => {
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
    */
    // DBの参照
    /*
    let itemRef = db.collection('users')
    .doc(this.props.userID)
    .collection('stock_items')
    .doc(this.state.item_id)

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
      image_url: this.state.image_url,
      updated_at: firebase.firestore.FieldValue.serverTimestamp()
    }).then(ref => {
      // undefined
      //console.log('Updated document : ', ref);
    });

    // カテゴリ側にitemIDを登録
    if(this.state.old_category_id !== this.state.category_id){
      if(this.state.old_category_id !== ""){
        // もとのカテゴリからitemIDを削除
        let oldCategoryRef = db.collection('users')
        .doc(this.props.userID)
        .collection('categories')
        .doc(this.state.old_category_id)
        let oldCetegoryData = (await oldCategoryRef.get()).data()
        // DBからそのカテゴリが登録されているitemIDのリストを取得
        let oldCetegoryItems = oldCetegoryData.item_id || []
        let oldCategoryList = oldCetegoryItems.filter(item => item !== this.state.category_id)
        oldCategoryRef.update({
          item_id: oldCategoryList
        })
      }

      // 新しいカテゴリにitemIDを追加
      let newCategoryRef = db.collection('users')
      .doc(this.props.userID)
      .collection('categories')
      .doc(this.state.category_id)
      let newCetegoryData = (await newCategoryRef.get()).data()
      // DBからそのカテゴリが登録されているitemIDのリストを取得
      let newCetegoryItems = newCetegoryData.item_id || []
      newCetegoryItems.push(this.state.category_id)
      newCategoryRef.update({
        item_id: newCetegoryItems
      })
    }
    */

    await this.db.updateStockItems(this.props.userID, this.state.item_id)
    await this.db.imageUpload(this.props.userID, this.state.item_id)
    await this.db.updateCategory(this.props.userID, this.state.item_id, this.state.old_category_id, this.state.category_id)

    this.props.handleClose(this.state)
  }


  // add されたとき、DBに追加してモーダルに通知
  async handleAddSubmit(event){

    this.setState({submitButtonCheck: true})

    await this.db.addStockItems(this.props.userID)
    await this.db.imageUpload(this.props.userID, this.state.item_id)
    await this.db.addCategory(this.props.userID, this.state.item_id, this.state.category_id)

    /*
    let addDoc = db.collection('users').doc(this.props.userID).collection('stock_items')
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
      //console.log('Added document with ID: ', ref.id);
      this.setState({item_id: ref.id})  
    });
    
    */
    /*
   if(this.state.category_id !== ""){
    // カテゴリにitemIDを追加
    let newCategoryRef = db.collection('users')
    .doc(this.props.userID)
    .collection('categories')
    .doc(this.state.category_id)
    let newCetegoryData = (await newCategoryRef.get()).data()
    // DBからそのカテゴリが登録されているitemIDのリストを取得
    let newCetegoryItems = newCetegoryData.item_id || []
    newCetegoryItems.push(this.state.category_id)
    
    newCategoryRef.update({
      item_id: newCetegoryItems
    })
   }


    // 画像をstorageに保存
    const imageUploadPromise = new Promise((resolve, reject) => {
      if(this.state.local_image){
        let storageRef = firebase.storage().ref().child(`users/${this.props.userID}/${this.state.item_id}.jpg`);
        storageRef.put(this.state.local_image)
        .then(snapshot => {
          snapshot.ref.getDownloadURL().then(url => {
            addDoc.doc(this.state.item_id).set({image_url: url}, { merge: true });
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
    */

    this.props.handleClose(this.state)
  }

  modal = {
    addCategoryOpen: () => {
      this.setState({isAddCategoryOpen: true})
    },
    addCategoryClose: () => {
      this.setState({isAddCategoryOpen: false})
    }
  }

  addCategoryHandler(){
    if(this.state.addCategoryText !== ""){
      let new_list = this.state.category_list.slice()
      new_list.push(this.state.addCategoryText)

  
      if(new_list.length <= MAX_CATEGORY_SIZE){
        this.setState({category_list: new_list, category: this.state.addCategoryText})
        
        var userRef = db.collection('users').doc(this.props.userID)
        /*
        categoryListRef.update({
            category: firebase.firestore.FieldValue.arrayUnion(this.state.addCategoryText)
        })
        */

        // category_itemの追加
        // カテゴリ名が存在していないときのみ追加する
        if(!(this.state.addCategoryText in this.state.category_map)){
          var categoryDoc = userRef.collection('categories')
          categoryDoc.add({
            name: this.state.addCategoryText,
            item_id: [],
            created_at: firebase.firestore.FieldValue.serverTimestamp(),
            updated_at: firebase.firestore.FieldValue.serverTimestamp()    
          }).then(ref => {
            // カテゴリ名とIDの紐づけ
              let new_category_map = JSON.parse(JSON.stringify(this.state.category_map))
              new_category_map[ref.id] = this.state.addCategoryText
              userRef.update({ category_map: new_category_map })

              //let new_category_id = this.state.category_id
              //new_category_id.push(ref.id)
              let new_category_id = ref.id
              this.setState({category_map: new_category_map, category_id: new_category_id})
          })
        }

        // カテゴリ追加の表示を閉じる
        this.setState({isAddCategoryOpen: false})
      }  
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
          addCategoryHandler={this.addCategoryHandler.bind(this)}
          addCategoryOpen={this.modal.addCategoryOpen}
          addCategoryClose={this.modal.addCategoryClose}
          handleValueChanege={this.callbacks.handleChanege}
          handleCategoryChanege={this.callbacks.handleCategoryChanege}
          imageChangeHandler={this.callbacks.handleImageChange}
          {...this.state}
        />

      <div className="add-stock-submit-button">
        <Button 
          variant="outlined" 
          onClick={this.handleAddSubmit.bind(this)} 
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
          addCategoryHandler={this.addCategoryHandler.bind(this)}
          addCategoryOpen={this.modal.addCategoryOpen}
          addCategoryClose={this.modal.addCategoryClose}
          handleValueChanege={this.callbacks.handleChanege}
          handleCategoryChanege={this.callbacks.handleCategoryChanege}
          imageChangeHandler={this.callbacks.handleImageChange}
          {...this.state}
        />

        <div className="update-stock-submit-button">
          <Button 
          variant="outlined" 
          onClick={this.handleUpdateSubmit.bind(this)} 
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

