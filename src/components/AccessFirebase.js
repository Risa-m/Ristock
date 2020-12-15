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
  },
  imageUploadToStrage: async (userID, itemID, image) => {
    let storageRef = firebase.storage().ref().child(`users/${userID}/${itemID}.jpg`)
    let url = await storageRef.put(image)
                              .then(snapshot => { return snapshot.ref.getDownloadURL()})
    return url
  },
  imageUrlRegister: async (userID, itemID, imageUrl) => {
    let itemRef = db.collection('users').doc(userID)
                    .collection('stock_items').doc(itemID)
    return await itemRef.set({image_url: imageUrl}, { merge: true })
  }



}


export default AccessFireBase