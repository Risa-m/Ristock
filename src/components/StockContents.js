import React, { useState, useEffect } from 'react'
import firebase, { db } from '../firebase'
import './components.css'
import PropTypes from 'prop-types';

import { resizeImage } from 'components/ResizeImage';
import cellNameToLabels from 'components/cellNameToLabels';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';

import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import DoneIcon from '@material-ui/icons/Done';
import CloseIcon from '@material-ui/icons/Close';

import AddPhotoAlternateIcon from "@material-ui/icons/AddPhotoAlternate";

import AddRoundedIcon from '@material-ui/icons/AddRounded';
import RemoveRoundedIcon from '@material-ui/icons/RemoveRounded';


const MAX_CATEGORY_SIZE = 100
const MAX_TEXT_INPUT_LENGTH = 20
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

  // form が変更されたとき、stateも更新
  handleChanege(property, event) {
    this.setState({ [property] : event.target.value})
  }


  // update されたとき、DBを更新してモーダルに通知
  async handleUpdateSubmit(event){

    this.setState({submitButtonCheck: true})

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

    // DBの参照
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

    this.props.handleClose(this.state)
  }


  // add されたとき、DBに追加してモーダルに通知
  async handleAddSubmit(event){

    this.setState({submitButtonCheck: true})

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

    this.props.handleClose(this.state)
  }

  addCategoryOpen(){
    this.setState({isAddCategoryOpen: true})
  }

  addCategoryClose(){
    this.setState({isAddCategoryOpen: false})
  }

  handleCategoryChanege(event) {
    //let new_id = Object.keys(this.state.category_map).filter(val => val === event.target.value)
    this.setState({category : this.state.category_map[event.target.value], category_id: event.target.value})
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

  async imageChangeHandler(e) {
    const { imageFile, imageUri } = await resizeImage(e, IMAGE_MAX_SIZE);
    this.setState({
      local_image: imageFile,
      local_image_src: imageUri,
    });
  }

  
  phonePlusMinusTemplate = (props) => {
    return (
      <div className="stock-form-phone-view">
        <div className="stock-form-phone-view-item" onClick={() => this.setState({[props.property]: (this.state[props.property]+1)})}><AddRoundedIcon /></div>
        <div className="stock-form-phone-view-item" onClick={() => (this.state[props.property] > 0)? this.setState({[props.property]: (this.state[props.property]-1)}):null}><RemoveRoundedIcon /></div>
      </div>
    )
  }

  gridTemplate = () => {  
    return (
      <form className="stock-form" noValidate autoComplete="off">
      <Grid container spacing={3}>
        
        {/*
        <Grid item xs={12} sm={6}>
          <TextField id="standard-basic" className="stock-form-text" value={this.state.name} InputProps={{ inputProps: { maxLength: MAX_TEXT_INPUT_LENGTH} }} label="名前" onChange={this.handleChanege.bind(this, "name")}/> 
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField id="standard-basic" className="stock-form-text" value={this.state.modelNumber} InputProps={{ inputProps: { maxLength: MAX_TEXT_INPUT_LENGTH} }} label="型番" onChange={this.handleChanege.bind(this, "modelNumber")}/> 
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField id="standard-basic" className="stock-form-text" value={this.state.size} InputProps={{ inputProps: { maxLength: MAX_TEXT_INPUT_LENGTH} }} label="サイズ" onChange={this.handleChanege.bind(this, "size")}/> 
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField id="standard-basic" className="stock-form-text" value={this.state.color} InputProps={{ inputProps: { maxLength: MAX_TEXT_INPUT_LENGTH} }} label="色" onChange={this.handleChanege.bind(this, "color")}/> 
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField id="standard-number" className="stock-form-text" type="number" value={this.state.stockNumber} InputProps={{ inputProps: { min: 0} }} label="残数" onChange={this.handleChanege.bind(this, "stockNumber")} InputLabelProps={{shrink: true,}}/> 
          {//<this.phonePlusMinusTemplate property="stockNumber"/>
          }
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField id="standard-number" className="stock-form-text" type="number" value={this.state.price} label="価格" InputProps={{ inputProps: { min: 0} }} onChange={this.handleChanege.bind(this, "price")} InputLabelProps={{shrink: true,}}/> 
        </Grid>
        */}
        {
        <StockContentDetailsView 
          handleValueChanege={this.handleChanege.bind(this)}
          {...this.state}/>
        }


        <Grid item xs={12} sm={6}>
          <CategorySelectionView 
            isAddCategoryOpen={this.state.isAddCategoryOpen}
            addCategoryText={this.state.addCategoryText}
            addCategoryHandler={this.addCategoryHandler.bind(this)}
            addCategoryOpen={this.addCategoryOpen.bind(this)}
            addCategoryClose={this.addCategoryClose.bind(this)}
            handleCategoryChanege={this.handleCategoryChanege.bind(this)}
            category_map={this.state.category_map}
            category_id={this.state.category_id}
            handleValueChanege={this.handleChanege.bind(this)}
          />

        </Grid>

        <Grid item xs={12} sm={6}>
        <ImageUploadView 
          image_url={this.state.image_url}
          local_image_src={this.state.local_image_src}
          imageChangeHandler={this.imageChangeHandler.bind(this)}/>
        </Grid>
      </Grid>
      </form>
    )
  
  }

  render(){
    // Add
    if(this.props.userID && (!this.state.item_id || !this.state.data)){
      return (
      <div className="stock-add-root">
      <p></p>
      <this.gridTemplate />

      <div className="add-stock-submit-button">
        <Button variant="outlined" onClick={this.handleAddSubmit.bind(this)} disabled={!(this.state.name) || this.state.submitButtonCheck}>Save</Button>
      </div>
    </div>
    )
    }


    // Details and Update
    if(this.props.userID && this.state.data){
      return (
        <div className="stock-detail-root">

          <this.gridTemplate />

        <div className="update-stock-submit-button">
          <Button variant="outlined" onClick={this.handleUpdateSubmit.bind(this)} disabled={!(this.state.name) || this.state.submitButtonCheck}>Save</Button>
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


const StockContentDetailsView = (props) => {
  const { isAddCategoryOpen, addCategoryText, category_map, category_id, image_url, local_image_src } = props

  const ValueTextField = (obj) => {
    if(obj.type === "string"){
      return (
        <TextField 
          id="standard-basic" 
          className="stock-form-text" 
          value={props[obj.value]} 
          InputProps={{ inputProps: { maxLength: MAX_TEXT_INPUT_LENGTH } }} 
          label={obj.label}
          onChange={(event) => props.handleValueChanege(obj.value, event)}/> 
      )  
    }
    else if(obj.type === "number"){
      return (
          <TextField 
            id="standard-number" 
            className="stock-form-text" 
            type="number" 
            value={props[obj.value]} 
            InputProps={{ inputProps: { min: 0} }} 
            label={obj.label} 
            onChange={(event) => props.handleValueChanege(obj.value, event)} 
            InputLabelProps={{shrink: true,}}/> 
      )  
    }
    else {
      return null
    }
  }

  return (
    <>
      {cellNameToLabels
        .filter(obj => obj.value !== "category")
        .map((obj, idx) => (
          <Grid item xs={12} sm={6} key={idx}>
            {ValueTextField(obj)}
          </Grid>
        )
      )}

      {/*
      <Grid item xs={12} sm={6}>
        <CategorySelectionView 
          isAddCategoryOpen={isAddCategoryOpen}
          addCategoryText={addCategoryText}
          addCategoryHandler={props.addCategoryHandler}
          addCategoryOpen={props.addCategoryOpen}
          addCategoryClose={props.addCategoryClose}
          handleCategoryChanege={props.handleCategoryChanege}
          category_map={category_map}
          category_id={category_id}
          handleValueChanege={props.handleChanege}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <ImageUploadView 
          image_url={image_url}
          local_image_src={local_image_src}
          imageChangeHandler={props.imageChangeHandler}/>
      </Grid>
      */}
    </>
  )
}

StockContentDetailsView.propTypes = {
  addCategoryHandler: PropTypes.func,
  addCategoryOpen: PropTypes.func,
  addCategoryClose: PropTypes.func,
  category_map: PropTypes.object,
  category_id: PropTypes.string,
  image_url: PropTypes.string,
  local_image_src: PropTypes.string,
  imageChangeHandler: PropTypes.func,
}



const CategorySelectionView = (props) => {
  const { isAddCategoryOpen, addCategoryText, category_map, category_id } = props

  if(isAddCategoryOpen){
    return (
      <>
      <div className="stock-form-category-add">
        <TextField 
          id="standard-basic" 
          className="stock-form-category-add-text" 
          value={addCategoryText} 
          label="Add Category" 
          InputProps={{ inputProps: { maxLength: MAX_TEXT_INPUT_LENGTH} }} 
          onChange={(event) => props.handleValueChanege("addCategoryText", event)}/>
        <IconButton 
          aria-label="add-category" 
          className="stock-form-category-add-button" 
          onClick={() => props.addCategoryHandler()}>
          <DoneIcon fontSize="small" />
        </IconButton>
        <IconButton 
          aria-label="add-category" 
          className="stock-form-category-add-button" 
          onClick={() => props.addCategoryClose()}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </div>
      </>
    )
  }
  // カテゴリ選択
  else {
    return (
      <>
      <TextField
          id="standard-select"
          className="stock-form-category-select"
          select
          label="カテゴリー"
          value={category_id}
          onChange={event => props.handleCategoryChanege(event)}
      >
        {Object.keys(category_map).map((category_id, idx) => (
          <MenuItem key={idx} value={category_id /* event.target.value */}>
            {category_map[category_id]/* dropdownに表示する項目 */}
          </MenuItem>
        ))}
      </TextField>
      <IconButton 
        aria-label="add-category" 
        className="stock-form-category-select-button" 
        onClick={() => props.addCategoryOpen()}>
        <AddIcon fontSize="small" />
      </IconButton>
      </>
    )
  }
}


CategorySelectionView.propTypes = {
  isAddCategoryOpen: PropTypes.bool,
  addCategoryText: PropTypes.string,
  addCategoryHandler: PropTypes.func,
  addCategoryOpen: PropTypes.func,
  addCategoryClose: PropTypes.func,
  handleCategoryChanege: PropTypes.func,
  category_map: PropTypes.object,
  category_id: PropTypes.string,
  handleValueChanege: PropTypes.func,
}

const ImageUploadView = (props) => {
  const { image_url, local_image_src } = props

  const UploadedImage = () => {
    if(image_url && !local_image_src){
      return <img src={image_url} className="stock-form-image-show"/>
    }
    else if(local_image_src) {
      return <img src={local_image_src} className="stock-form-image-show"/>
    }
    else {
      return null
    }
  }

  return (
    <>
    <input
        accept="image/*"
        id="contained-button-file"
        type="file"
        className="image-input"
        onChange={e => props.imageChangeHandler(e)}
      />
      <label htmlFor="contained-button-file">
        <Button variant="contained" color="primary" component="span">
          Upload
          <AddPhotoAlternateIcon />
        </Button>
      </label>
      {UploadedImage()}
    </>
  )
}

ImageUploadView.propTypes = {
  image_url: PropTypes.string,
  local_image_src: PropTypes.string,
  imageChangeHandler: PropTypes.func,
}

