import React from 'react'
import firebase, { db } from '../firebase'
import DBTemplate from 'components/DBTemplate';

const AccessFireBase = {
  getItemContent: async (userID, itemID) => {
    if(userID && itemID){
      let itemRef = db.collection('users').doc(userID)
                      .collection('stock_items').doc(itemID)
      let doc = await itemRef.get()
      return doc.data()
    }else {
      return DBTemplate.content_none
    }
  }



}


export default AccessFireBase