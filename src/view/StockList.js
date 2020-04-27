import React from 'react'
import { Link } from 'react-router-dom'
import firebase, { db } from '../firebase'
import Button from '@material-ui/core/Button';


export class StockList extends React.Component{ 
  constructor(props){
    super(props)

    this.state = {
      user: this.props.user
    }

  }

  getDocs(){
    console.log("getDocs")
    if(this.state.user != null){
      db.collection('users').doc(this.state.user.uid).get()
      .then(doc => {
        console.log(doc.data())
      })
      .catch(error =>{
        console.log("Error : ", error)
      })
    }
  }

  render(){
    this.getDocs()
    return (
    <div className="stock-list-root">
      Stock List 
      <div>
        <Link to='/stocks/add'>Add Stocks</Link>
      </div>
    </div>
    )
  }
}
