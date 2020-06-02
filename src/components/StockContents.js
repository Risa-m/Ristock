import React from 'react'
import { Link } from 'react-router-dom'
import firebase, { db, storage } from '../firebase'
import './components.css'

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';

import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import DoneIcon from '@material-ui/icons/Done';

import AddPhotoAlternateIcon from "@material-ui/icons/AddPhotoAlternate";


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
      addCategory: "",
      category_list: [],
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
        image_url: this.state.data.image_url,
      })
    }
  }

  // form が変更されたとき、stateも更新
  handleChanege(property, event) {
    this.setState({ [property] : event.target.value})
  }


  // update されたとき、DBを更新してモーダルに通知
  async handleUpdateSubmit(event){
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
      console.log('Updated document : ', ref);
    });

    this.props.handleClose(this.state)
  }


  // add されたとき、DBに追加してモーダルに通知
  async handleAddSubmit(event){

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
      console.log('Added document with ID: ', ref.id);
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


  // カテゴリの扱い
  // category_list : [[ Firestore ID, name ], ...]
  addCategory(){
    let new_list = this.state.category_list.slice()
    new_list.push(this.state.addCategory)
    this.setState({isAddCategoryOpen: false, category_list: new_list})
  }

  handleImage = event => {
    const image = event.target.files[0];
    console.log(image)
    var createObjectURL = (window.URL || window.webkitURL).createObjectURL || window.createObjectURL;
    const image_url = createObjectURL(image);
    this.setState({local_image: image, local_image_src: image_url})
  };

  gridTemplate = () => {  
    return (
      <form className="stock-form" noValidate autoComplete="off">
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <TextField id="standard-basic" value={this.state.name} label="名前" onChange={this.handleChanege.bind(this, "name")}/> 
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField id="standard-basic" value={this.state.modelNumber} label="型番" onChange={this.handleChanege.bind(this, "modelNumber")}/> 
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField id="standard-basic" value={this.state.size} label="サイズ" onChange={this.handleChanege.bind(this, "size")}/> 
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField id="standard-basic" value={this.state.color} label="色" onChange={this.handleChanege.bind(this, "color")}/> 
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField id="standard-number" type="number" value={this.state.stockNumber} label="残数" onChange={this.handleChanege.bind(this, "stockNumber")} InputLabelProps={{shrink: true,}}/> 
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField id="standard-number" type="number" value={this.state.price} label="価格" onChange={this.handleChanege.bind(this, "price")} InputLabelProps={{shrink: true,}}/> 
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField id="standard-number" type="number" value={this.state.lotSize} label="入り数" onChange={this.handleChanege.bind(this, "lotSize")} InputLabelProps={{shrink: true,}}/> 
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {
        <TextField
          id="standard-select"
          select
          label="Select"
          value={this.state.category}
          onChange={this.handleChanege.bind(this, "category")}
          helperText="カテゴリー"
        >
          {this.state.category_list.map((category, idx) => (
            <MenuItem key={idx} value={category}>
              {category}
            </MenuItem>
          ))}
        </TextField>
        }
          {(this.state.isAddCategoryOpen)?
          <>
          <TextField id="standard-basic" value={this.state.addCategory} label="add category" onChange={this.handleChanege.bind(this, "addCategory")}/>
          <IconButton aria-label="add-category" onClick={this.addCategory.bind(this)}>
            <DoneIcon fontSize="small" />
            {console.log("isAddCategoryOpen")}
          </IconButton>
          </>
          :
          <IconButton aria-label="add-category" onClick={this.addCategoryOpen.bind(this)}>
            <AddIcon fontSize="small" />
            {console.log("isAddCategoryOpen")}
          </IconButton>
          }
        </Grid>
        <Grid item xs={12} sm={6}>
        <input
            accept="image/*"
            id="contained-button-file"
            type="file"
            className="image-input"
            onChange={this.handleImage}
          />
          <label htmlFor="contained-button-file">
            <Button variant="contained" color="primary" component="span">
              Upload
              <AddPhotoAlternateIcon />
            </Button>
          </label>
          <img src={this.state.local_image_src} height="50" style={{position: "10px" ,padding: "5px"}}/>
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
      <p>Add </p>
        {this.gridTemplate()}

      <div className="add-stock-submit-button">
        <Button variant="outlined" onClick={this.handleAddSubmit.bind(this)}>Save</Button>
      </div>
    </div>
    )
    }


    // Details and Update
    if(this.props.userID && this.state.data){
      return (
        <div className="stock-detail-root">
        <p>Details</p>
          {console.log("[Stock Contents] item_id: ",this.state.item_id)}  
          {console.log("[Stock Contents] data: ",this.state.data)}

        {this.gridTemplate()}

        <div className="update-stock-submit-button">
          <Button variant="outlined" onClick={this.handleUpdateSubmit.bind(this)}>Save</Button>
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