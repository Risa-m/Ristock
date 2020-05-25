import React from 'react'
import { Link } from 'react-router-dom'
import firebase, { db } from '../firebase'
import './views.css';


export class StockDetail extends React.Component{ 
  constructor(props){
    super(props)

    //const item_id = props.match.params.id
    this.state = {
      item_id: props.item_id,
      data: null
    }
  }

  async componentDidMount() {
    await this.getDocs()
  }

  async getDocs(){
    if(this.props.userID){
      console.log("details: getDocs")
      let itemRef = db.collection('users')
                      .doc(this.props.userID)
                      .collection('stock_items')
                      .doc(this.state.item_id)
      let doc = await itemRef.get()
      await this.setState({data: doc.data()})
      //let snapshots = await colRef.get()
      //let docs = snapshots.docs.map(doc => [doc.id, doc.data()])
      //await this.setState({list : docs})      
    }
  }

  render(){
    return (
    <div className="stock-detail-root">
      <p>Details</p>
      <p>{this.state.item_id}</p>
      {console.log(this.state.data)}
      <p>{(this.state.data)?
      this.state.data["name"]
      :
      null}</p>
    </div>
    )
  }
}
