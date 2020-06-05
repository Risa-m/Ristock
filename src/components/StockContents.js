import React from 'react'
import firebase, { db } from '../firebase'
import './components.css'

import { resizeImage } from './ResizeImage';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';

import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import DoneIcon from '@material-ui/icons/Done';
import CloseIcon from '@material-ui/icons/Close';

import AddPhotoAlternateIcon from "@material-ui/icons/AddPhotoAlternate";


const MAX_CATEGORY_SIZE = 100
const MAX_TEXT_INPUT_LENGTH = 20
const IMAGE_MAX_SIZE = 512

export class StockContents extends React.Component{
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
      category: "",
      image_url: "",

      local_image: null,
      local_image_src: null,

      isAddCategoryOpen: false,
      addCategoryText: "",
      category_list: this.props.category_list,

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
      this.setState({data: doc.data()})

      this.setState({
        name: this.state.data.name,
        modelNumber: this.state.data.modelNumber,
        size: this.state.data.size,
        color: this.state.data.color,
        stockNumber: this.state.data.stockNumber,
        price: this.state.data.price,
        lotSize: this.state.data.lotSize,
        category: this.state.data.category,
        image_url: this.state.data.image_url || "",
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
      image_url: this.state.image_url,
    }).then(ref => {
      // undefined
      //console.log('Updated document : ', ref);
    });

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
    }).then(ref => {
      //console.log('Added document with ID: ', ref.id);
      this.setState({item_id: ref.id})  
    });
        
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

  addCategoryHandler(){
    if(this.state.addCategoryText !== ""){
      let new_list = this.state.category_list.slice()
      new_list.push(this.state.addCategoryText)
      this.setState({isAddCategoryOpen: false})
  
      if(new_list.length <= MAX_CATEGORY_SIZE){
        this.setState({category_list: new_list, category: this.state.addCategoryText})
        var categoryRef = db.collection('users').doc(this.props.userID)
        categoryRef.update({
            category: firebase.firestore.FieldValue.arrayUnion(this.state.addCategoryText)
        });
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

  gridTemplate = () => {  
    return (
      <form className="stock-form" noValidate autoComplete="off">
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <TextField id="standard-basic" value={this.state.name} InputProps={{ inputProps: { maxLength: MAX_TEXT_INPUT_LENGTH} }} label="名前" onChange={this.handleChanege.bind(this, "name")}/> 
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField id="standard-basic" value={this.state.modelNumber} InputProps={{ inputProps: { maxLength: MAX_TEXT_INPUT_LENGTH} }} label="型番" onChange={this.handleChanege.bind(this, "modelNumber")}/> 
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField id="standard-basic" value={this.state.size} InputProps={{ inputProps: { maxLength: MAX_TEXT_INPUT_LENGTH} }} label="サイズ" onChange={this.handleChanege.bind(this, "size")}/> 
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField id="standard-basic" value={this.state.color} InputProps={{ inputProps: { maxLength: MAX_TEXT_INPUT_LENGTH} }} label="色" onChange={this.handleChanege.bind(this, "color")}/> 
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField id="standard-number" type="number" value={this.state.stockNumber} InputProps={{ inputProps: { min: 0} }} label="残数" onChange={this.handleChanege.bind(this, "stockNumber")} InputLabelProps={{shrink: true,}}/> 
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField id="standard-number" type="number" value={this.state.price} label="価格" InputProps={{ inputProps: { min: 0} }} onChange={this.handleChanege.bind(this, "price")} InputLabelProps={{shrink: true,}}/> 
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField id="standard-number" type="number" value={this.state.lotSize} label="入り数" InputProps={{ inputProps: { min: 0} }} onChange={this.handleChanege.bind(this, "lotSize")} InputLabelProps={{shrink: true,}}/> 
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          {(this.state.isAddCategoryOpen)?
          <div className="stock-form-category-add">
          {/* カテゴリ追加 */}
          <TextField id="standard-basic" className="stock-form-category-add-text" value={this.state.addCategoryText} label="Add Category" InputProps={{ inputProps: { maxLength: MAX_TEXT_INPUT_LENGTH} }} onChange={this.handleChanege.bind(this, "addCategoryText")}/>
          <IconButton aria-label="add-category" className="stock-form-category-add-button" onClick={this.addCategoryHandler.bind(this)}>
            <DoneIcon fontSize="small" />
          </IconButton>
          <IconButton aria-label="add-category" className="stock-form-category-add-button" onClick={e => {this.setState({isAddCategoryOpen: false})}}>
            <CloseIcon fontSize="small" />
          </IconButton>
          </div>
          :
          <>
          {/* カテゴリ選択 */}
          {<TextField
              id="standard-select"
              className="stock-form-category-select"
              select
              label="カテゴリー"
              value={this.state.category}
              onChange={this.handleChanege.bind(this, "category")}
            >
              {this.state.category_list.map((category, idx) => (
                <MenuItem key={idx} value={category}>
                  {category}
                </MenuItem>
              ))}
            </TextField>
            }    
          <IconButton aria-label="add-category" className="stock-form-category-select-button" onClick={this.addCategoryOpen.bind(this)}>
            <AddIcon fontSize="small" />
          </IconButton>
          </>
          }
        </Grid>

        <Grid item xs={12} sm={6}>
        <input
            accept="image/*"
            id="contained-button-file"
            type="file"
            className="image-input"
            onChange={e => this.imageChangeHandler(e)}
          />
          <label htmlFor="contained-button-file">
            <Button variant="contained" color="primary" component="span">
              Upload
              <AddPhotoAlternateIcon />
            </Button>
          </label>
          {(this.state.image_url && !this.state.local_image_src)?
          <img src={this.state.image_url} className="stock-form-image-show"/>
          :(this.state.local_image_src)?
          <img src={this.state.local_image_src} className="stock-form-image-show"/>
          :null}
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
        <p></p>

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