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
  },
  addItemContent: async (userID, itemContent) => {
    let addDoc = db.collection('users').doc(userID)
                   .collection('stock_items')
    let itemID = await addDoc.add(DBTemplate.add_content(itemContent))
                             .then(ref => {return ref.id})
    return itemID
  },
  updateItemContent: async (userID, itemID, itemContent) => {
    let itemRef = db.collection('users').doc(userID)
                    .collection('stock_items').doc(itemID)
    await itemRef.update(DBTemplate.update_content(itemContent))
  }



}


export default AccessFireBase