import React from 'react'
import { Link } from 'react-router-dom'
import firebase, { db } from '../firebase'
import Button from '@material-ui/core/Button';


export class StockList extends React.Component{ 
  constructor(props){
    super(props)

    this.state = {
      list: []
    }
  }
  async componentDidMount() {
    await this.getDocs()
  }

  async getDocs(){
    if(this.props.userID){
      let colRef = db.collection('users')
                      .doc(this.props.userID)
                      .collection('stock_items')
      let snapshots = await colRef.get()
      let docs = snapshots.docs.map(doc => [doc.id, doc.data()])
      await this.setState({list : docs})      
    }

    /*
    if(this.props.user != null){
      await db.collection('users').doc(this.props.userID).collection('stock_items').get()
      .then(snapshot => {
        let docs = snapshot.docs.map(doc => [doc.id, doc.data()])
        this.setState({list: docs})
      })
      .catch(error =>{
        console.log("Error : ", error)
      })
    }*/
  }

  render(){
    return (
    <div className="stock-list-root">
      Stock List 
      <div>
        {this.state.list.map(item => (
          <ul key={item[0]}>
            <li>{item[1].name}</li>
          </ul>
        ))}
        <Link to='/stocks/add'>Add Stocks</Link>
      </div>
    </div>
    )
  }
}
