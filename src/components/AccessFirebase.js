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
    let categoryRef = db.collection('users').doc(userID)
    let userDoc = await categoryRef.get()
    let categoryMap = (userDoc.data()).category_map || {}
    return categoryMap
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
  },
  getItemIDListOfCategory: async (userID, categoryID) => {
    if(categoryID !== ""){
      let categoryRef = db.collection('users').doc(userID)
                          .collection('categories').doc(categoryID)
      let categoryDocData = await categoryRef.get().then(doc => doc.data())
      return categoryDocData.item_id || []
    }
  },
  updateItemIDListOfCategory: async (userID, categoryID, itemIDList) => {
    if(categoryID !== ""){
      let categoryRef = db.collection('users').doc(userID)
                          .collection('categories').doc(categoryID)
      await categoryRef.update(DBTemplate.category_update_content(itemIDList))
    }
  },
  createCategoryContent: async (userID, categoryName, categoryMap) => {
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
  },
  deleteCategoryContent: async (userID, categoryID, categoryMap) => {
    // item側からcategory_idを削除
    // category_idが削除したいものと一致しているitemを取得し、該当する各itemからcategory_idを削除
    let ItemContainsCategoryShots = await db.collection('users').doc(userID)
                                            .collection('stock_items')
                                            .where('category_id', '==', categoryID)
                                            .get()
    if(ItemContainsCategoryShots && !ItemContainsCategoryShots.empty){
      ItemContainsCategoryShots.forEach(doc => {
        doc.ref.update({
          category_id: ""
        })
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
  }



}


export default AccessFireBase