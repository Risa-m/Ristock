import React from 'react'
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom'
import firebase, { db } from '../firebase'

export class AddStock extends React.Component {

  constructor(props){
    super(props)

    this.state = {
      id: "",
      name: "",
      modelNumber: -1, //型番
      size: "",
      color: "",
      stockNumber: 0,
      price: -1,
      category: "",
      user: this.props.user
    }
    //const classes = useStyles();
  }

  handleChanege(property, event) {
    this.setState({ [property] : event.target.value})
    console.log(this.state[property])
  }

  handleSubmit(event){
    // DBに登録

    db.collection('users').doc(this.state.user.uid).get()
    .then((doc) => {
        console.log(doc.data())
    })
    .catch(error => {console.log("Error: ", error)});

  
    // postsのIDは自動生成
    let addDoc = db.collection('users').doc(this.state.user.uid).collection('stock_items').add({
      name: this.state.name,
      modelNumber: this.state.modelNumber,
      size: this.state.size,
      color: this.state.color,
      stockNumber: this.state.stockNumber,
      price: this.state.price,
      category: this.state.category,
    }).then(ref => {
      console.log('Added document with ID: ', ref.id);
    });
    
  }

  render(){
    return (
      <div className="add-stock-root">
        <p>{this.state.id}</p>
        {console.log(this.state.user.uid)}
        <ul>
        <form /*className={this.classes.root}*/ noValidate autoComplete="off">
          <TextField id="standard-basic" value={this.state.name} label="名前" onChange={this.handleChanege.bind(this, "name")}/> 
          <TextField id="standard-basic" value={this.state.modelNumber} label="型番" onChange={this.handleChanege.bind(this, "modelNumber")}/> 
          <TextField id="standard-basic" value={this.state.size} label="サイズ" onChange={this.handleChanege.bind(this, "size")}/> 
          <TextField id="standard-basic" value={this.state.color} label="色" onChange={this.handleChanege.bind(this, "color")}/> 
          <TextField id="standard-basic" value={this.state.stockNumber} label="残数" onChange={this.handleChanege.bind(this, "stockNumber")}/> 
          <TextField id="standard-basic" value={this.state.price} label="価格" onChange={this.handleChanege.bind(this, "price")}/> 
          <TextField id="standard-basic" value={this.state.category} label="入り数" onChange={this.handleChanege.bind(this, "category")}/> 
        </form>
        </ul>
        {!!this.state.name && !!this.state.color ? <p>{this.state.name}({this.state.modelNumber}) の {this.state.color} {this.state.size} は {this.state.stockNumber} 個あります。</p> : <p></p>}
        <Link to={`/stocks`}><Button variant="outlined" onClick={this.handleSubmit.bind(this)}>とうろくする！</Button></Link>
      </div>
      )
  }
}
