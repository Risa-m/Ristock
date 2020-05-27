import React from 'react'
import { Link } from 'react-router-dom'
import firebase, { db } from '../firebase'

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';



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
      await this.setState({data: doc.data()})

      this.setState({
        name: this.state.data.name,
        modelNumber: this.state.data.modelNumber,
        size: this.state.data.size,
        color: this.state.data.color,
        stockNumber: this.state.data.stockNumber,
        price: this.state.data.price,
        lotSize: this.state.data.lotSize,
        category: this.state.data.category,
      })
    }
  }

  // form が変更されたとき、stateも更新
  handleChanege(property, event) {
    console.log("[Stock Contents] handlechange property: ",[property])
    console.log("[Stock Contents] handlechange event: ",event)
    this.setState({ [property] : event.target.value})
  }

  // update されたとき、DBを更新してモーダルに通知
  async handleUpdateSubmit(event){
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
    }).then(ref => {
      console.log('Updated document : ', ref);
    });
    
    this.props.handleClose(this.state)
  }
  // add されたとき、DBに追加してモーダルに通知
  async handleAddSubmit(event){
    let addDoc = await db.collection('users').doc(this.props.userID).collection('stock_items').add({
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

    this.props.handleClose(this.state)
  }

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
          <TextField id="standard-basic" value={this.state.category} label="カテゴリー" onChange={this.handleChanege.bind(this, "category")}/> 
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