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
  getCategoryContent: async (userID) => {
    if(userID){
      let categoryRef = db.collection('users').doc(userID)
      let userDoc = await categoryRef.get()
      let categoryMap = (userDoc.data()).category_map || {}
      return categoryMap  
    }else{
      return {}
    }
  },
  imageUploadToStrage: async (userID, itemID, image) => {
    if(userID && itemID){
      let storageRef = firebase.storage().ref().child(`users/${userID}/${itemID}.jpg`)
      let url = await storageRef.put(image)
                                .then(snapshot => { return snapshot.ref.getDownloadURL()})
      return url  
    }else {
      return ""
    }
  },
  imageUrlRegister: async (userID, itemID, imageUrl) => {
    if(userID && itemID && imageUrl !== ""){
      let itemRef = db.collection('users').doc(userID)
                      .collection('stock_items').doc(itemID)
      await itemRef.set({image_url: imageUrl}, { merge: true })
    }
  },
  addItemContent: async (userID, itemContent) => {
    if(userID && itemContent !== {}){
      let addDoc = db.collection('users').doc(userID)
                     .collection('stock_items')
      let itemID = await addDoc.add(DBTemplate.add_content(itemContent))
                               .then(ref => {return ref.id})
      return itemID
    }else{
      return ""
    }
  },
  updateItemContent: async (userID, itemID, itemContent) => {
    if(userID && itemID && itemContent !== {}){
      let itemRef = db.collection('users').doc(userID)
                      .collection('stock_items').doc(itemID)
      await itemRef.update(DBTemplate.update_content(itemContent))
    }
  },
  getItemIDListOfCategory: async (userID, categoryID) => {
    if(userID && categoryID !== ""){
      let categoryRef = db.collection('users').doc(userID)
                          .collection('categories').doc(categoryID)
      let categoryDocData = await categoryRef.get().then(doc => doc.data())
      return categoryDocData.item_id || []
    }else {
      return []
    }
  },
  updateItemIDListOfCategory: async (userID, categoryID, itemIDList) => {
    if(userID && categoryID !== ""){
      let categoryRef = db.collection('users').doc(userID)
                          .collection('categories').doc(categoryID)
      await categoryRef.update(DBTemplate.category_update_content(itemIDList))
    }
  },
  createCategoryContent: async (userID, categoryName, categoryMap) => {
    if(userID && categoryName !== ""){
      let userRef = db.collection('users').doc(userID)
      let categoryRef = userRef.collection('categories')
  
      // categoryIDの新規発行
      let categoryID = await categoryRef.add(DBTemplate.category_create_content(categoryName))
                                        .then(ref => ref.id)
  
      // category mapの更新
      let newCategoryMap = JSON.parse(JSON.stringify(categoryMap)) // deep copy
      newCategoryMap[categoryID] = categoryName
      await userRef.update({ category_map: newCategoryMap })
  
      return [categoryID, newCategoryMap]  
    }else {
      return ["", categoryMap]
    }
  },
  deleteCategoryContent: async (userID, categoryID, categoryMap) => {
    if(userID && categoryID){
      // item側からcategory_idを削除
      // category_idが削除したいものと一致しているitemを取得し、該当する各itemからcategory_idを削除
      let ItemContainsCategoryShots = await db.collection('users').doc(userID)
                                              .collection('stock_items')
                                              .where('category_id', '==', categoryID)
                                              .get()
      if(ItemContainsCategoryShots && !ItemContainsCategoryShots.empty){
        ItemContainsCategoryShots.forEach(doc => {
          doc.ref.update({category_id: ""})
        })
      }
      // categoryIDの削除
      await db.collection('users').doc(userID)
              .collection('categories').doc(categoryID).delete()
      
      // category mapの更新
      let newCategoryMap = JSON.parse(JSON.stringify(categoryMap)) // deep copy
      delete newCategoryMap[categoryID]
      await db.collection('users').doc(userID).update({category_map: newCategoryMap})

      return newCategoryMap
    }else{
      return categoryMap
    }
  },
  updateCategoryName: async (userID, categoryID, categoryName, categoryMap) => {
    if(userID && categoryID && categoryName !== ""){
      let userRef = db.collection('users').doc(userID)
      let categoryRef = userRef.collection('categories').doc(categoryID)

      await categoryRef.update(DBTemplate.category_update_name(categoryName))

      let newCategoryMap = JSON.parse(JSON.stringify(categoryMap)) // deep copy
      newCategoryMap[categoryID] = categoryName
      await userRef.update({ category_map: newCategoryMap })

      return newCategoryMap
    }else{
      return categoryMap
    }
  },
  updateCategoryMap: async (userID, categoryID, categoryName, categoryMap) => {
    if(categoryID && categoryName !== ""){
      let userRef = db.collection('users').doc(userID)
      let newCategoryMap = JSON.parse(JSON.stringify(categoryMap)) // deep copy
      newCategoryMap[categoryID] = categoryName
      await userRef.update({ category_map: newCategoryMap })
      return newCategoryMap  
    }else {
      return categoryMap
    }
  }


}


export default AccessFireBase